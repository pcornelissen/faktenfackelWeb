import Database from 'better-sqlite3'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { stemGerman } from '../shared/fts/stem'
import { extractSections } from '../shared/fts/sections'

// Collection → Extra-Feld (zusätzlich zu tags) für die "extras"-Suchspalte.
const EXTRA_FIELD: Record<string, string | null> = {
  faktenchecks: 'subtitle',
  glossar: 'subject',
  quellen: 'description',
  zitate: 'teaser',
  lagerfeuer: 'subtitle',
  quellenlinks: null,
}

const SCHEMA = `
CREATE VIRTUAL TABLE fts USING fts5(
  title, extras, content,
  o_title UNINDEXED, o_excerpt UNINDEXED,
  path UNINDEXED, collection UNINDEXED, breadcrumb UNINDEXED, published_on UNINDEXED,
  tokenize = 'unicode61 remove_diacritics 2'
);
`

function parseTags(raw: unknown): string {
  if (typeof raw !== 'string') return ''
  try {
    const a = JSON.parse(raw)
    return Array.isArray(a) ? a.join(' ') : ''
  } catch { return '' }
}
function parseBody(raw: unknown): { value?: unknown[] } | null {
  if (typeof raw !== 'string') return (raw as { value?: unknown[] }) ?? null
  try {
    return JSON.parse(raw)
  } catch { return null }
}

export function buildFts(contentDbPath: string, ftsDbPath: string, collections: string[]): void {
  const outDir = dirname(ftsDbPath)
  if (outDir && outDir !== '.' && !existsSync(outDir)) mkdirSync(outDir, { recursive: true })
  const src = new Database(contentDbPath, { readonly: true })
  const out = new Database(ftsDbPath)
  out.pragma('journal_mode = WAL')
  out.exec(`DROP TABLE IF EXISTS fts; ${SCHEMA}`)

  const insert = out.prepare(
    `INSERT INTO fts (title, extras, content, o_title, o_excerpt, path, collection, breadcrumb, published_on)
     VALUES (@title, @extras, @content, @o_title, @o_excerpt, @path, @collection, @breadcrumb, @published_on)`,
  )

  const run = out.transaction(() => {
    for (const col of collections) {
      const table = `_content_${col}`
      const extraField = EXTRA_FIELD[col]
      let rows: Record<string, unknown>[]
      try {
        rows = src.prepare(`SELECT * FROM ${table}`).all() as Record<string, unknown>[]
      } catch { continue }

      for (const r of rows) {
        const path = String(r.path ?? r.id ?? '')
        if (!path || path.includes('/_info')) continue
        // Quellen-Profile haben kein title-Feld, sondern name → Fallback.
        const title = String(r.title || r.name || '').trim()
        const tags = parseTags(r.tags)
        const extraVal = extraField ? String(r[extraField] ?? '') : ''
        const extrasOrig = [extraVal, tags].filter(Boolean).join(' ')
        const body = parseBody(r.body)
        const sections = extractSections(body, { path, title })
        // Falls kein Body: trotzdem eine Zeile mit Titel/Extras (z.B. quellenlinks).
        const secs = sections.length ? sections : [{ path, title, breadcrumb: '', content: '' }]
        for (const s of secs) {
          // Keine leeren Treffer-Zeilen: Sektion braucht Titel oder Inhalt.
          if (!s.title.trim() && !s.content.trim()) continue
          insert.run({
            title: stemGerman(s.title),
            extras: stemGerman(extrasOrig),
            content: stemGerman(s.content),
            o_title: s.title,
            o_excerpt: s.content.slice(0, 200),
            path: s.path,
            collection: col,
            breadcrumb: s.breadcrumb,
            published_on: String(r.publishedOn ?? ''),
          })
        }
      }
    }
  })
  run()
  src.close()
  out.close()
}

// CLI: FTS_DB + CONTENT_DB pinnen den Output/Input (analog buildGraph.ts).
const COLLECTIONS = ['faktenchecks', 'glossar', 'quellen', 'quellenlinks', 'lagerfeuer', 'zitate']
if (import.meta.url === `file://${process.argv[1]}`) {
  const contentDb = process.env.CONTENT_DB || './.data/content/build.sqlite'
  const ftsDb = process.env.FTS_DB || './.data/fts.sqlite'
  buildFts(contentDb, ftsDb, COLLECTIONS)
  console.log(`FTS index built: ${ftsDb}`)
}
