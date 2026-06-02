import { defineEventHandler, getQuery, setHeader } from 'h3'
import { getFtsDb } from '../utils/ftsDb.node'
import { stemTokens } from '../../shared/fts/stem'
import { isPreview, todayIso } from '../utils/published'

interface Hit {
  path: string
  title: string
  excerpt: string
  collection: string
}

interface FtsRow {
  path: string
  o_title: string
  o_excerpt: string
  collection: string
  breadcrumb: string
}

interface CountRow {
  collection: string
  c: number
}

const ALLOWED_COLLECTIONS = ['faktenchecks', 'glossar', 'quellen', 'quellenlinks', 'lagerfeuer', 'zitate'] as const

export default defineEventHandler((event) => {
  const q = String(getQuery(event).q ?? '').trim()
  const typeParam = String(getQuery(event).type ?? '').trim()
  setHeader(event, 'Cache-Control', 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800')

  if (q.length < 2) return { results: [] as Hit[], counts: {} as Record<string, number> }

  const tokens = stemTokens(q)
  if (!tokens.length) return { results: [] as Hit[], counts: {} as Record<string, number> }

  // Jedes gestemmte Token als Prefix-MATCH, AND-verknüpft (Typeahead-tauglich).
  // Doppelte Anführungszeichen im Token werden entfernt, um MATCH-Syntax nicht zu brechen.
  const match = tokens.map(t => `"${t.replace(/"/g, '')}"*`).join(' ')
  const today = todayIso()
  const siteEnv = String(useRuntimeConfig(event).public.siteEnv ?? '')
  const preview = isPreview(siteEnv)

  const validType = (ALLOWED_COLLECTIONS as readonly string[]).includes(typeParam) ? typeParam : ''

  const db = getFtsDb()

  const baseParams: Record<string, string> = { match, today }
  // On dev (preview) all index rows are shown regardless of published_on.
  const publishedFilter = preview ? '' : 'AND (published_on = \'\' OR published_on <= @today)'

  // Counts-Query laeuft ohne Type-Filter, damit alle Chips immer ihre echten Gesamtzahlen
  // fuer den aktuellen Suchbegriff zeigen (unabhaengig vom aktiven Filter).
  const countRows = db.prepare(`
    SELECT collection, COUNT(DISTINCT path) AS c
    FROM fts
    WHERE fts MATCH @match
      ${publishedFilter}
    GROUP BY collection
  `).all(baseParams) as CountRow[]

  const counts: Record<string, number> = {}
  let total = 0
  for (const row of countRows) {
    counts[row.collection] = row.c
    total += row.c
  }
  counts.all = total

  const params: Record<string, string> = { ...baseParams }
  let typeFilter = ''
  if (validType) {
    typeFilter = 'AND collection = @type'
    params.type = validType
  }

  // Mehr Kandidaten laden, dann per path deduplizieren.
  // Der FTS-Index hat eine Zeile pro Abschnitt (Heading), daher koennen mehrere Zeilen
  // auf dasselbe Dokument verweisen. bm25-Reihenfolge bleibt erhalten; die erste
  // (best-ranked) Zeile je path gewinnt.
  // Dokumenttitel: breadcrumb || o_title — bei Top-Abschnitten ist breadcrumb='',
  // o_title = Dokumenttitel; bei Heading-Abschnitten ist breadcrumb = Dokumenttitel.
  const rows = db.prepare(`
    SELECT path AS path, o_title AS o_title, o_excerpt AS o_excerpt,
           collection AS collection, breadcrumb AS breadcrumb
    FROM fts
    WHERE fts MATCH @match
      ${publishedFilter}
      ${typeFilter}
    ORDER BY bm25(fts, 10.0, 5.0, 1.0)
    LIMIT 200
  `).all(params) as FtsRow[]

  const seen = new Set<string>()
  const results: Hit[] = []
  for (const row of rows) {
    if (seen.has(row.path)) continue
    seen.add(row.path)
    results.push({
      path: row.path,
      title: row.breadcrumb || row.o_title,
      excerpt: row.o_excerpt,
      collection: row.collection,
    })
    if (results.length === 30) break
  }

  return { results, counts }
})
