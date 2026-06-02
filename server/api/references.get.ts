import { defineEventHandler, getQuery } from 'h3'
import { queryCollection } from '@nuxt/content/server'
import { isPreview, todayIso, setContentCache } from '../utils/published'

// Server-lokaler Minimaltyp: hier wird nur `path` verwendet; die vollständigen
// Records gehen als JSON raus und werden client-seitig typisiert. App-Typen
// (referenceData/contentUtils) werden bewusst NICHT importiert -- ein `import type`
// von dort zöge das Page-Macro `definePageMeta` ins Server-Typprogramm und bricht
// den Typecheck (contentUtils.definePageData ruft definePageMeta auf).
type PathItem = { path: string }

function collectionForPath(path: string): string | null {
  if (path.startsWith('/faktenchecks/')) return 'faktenchecks'
  if (path.startsWith('/lagerfeuer/')) return 'lagerfeuer'
  if (path.startsWith('/glossar/')) return 'glossar'
  if (path.startsWith('/news/')) return 'news'
  if (path.startsWith('/quellen/')) {
    if (path.includes('/links/')) return 'quellenlinks'
    if (path.includes('/zitate/')) return 'zitate'
    return 'quellen'
  }
  return null
}

function buildSourcePath(path: string): string {
  const segments = path.split('/')
  return '/quellen/' + segments[2] + '/' + segments[3]
}

export default defineEventHandler(async (event) => {
  const preview = isPreview(String(useRuntimeConfig(event).public.siteEnv ?? ''))
  setContentCache(event, preview)
  const path = String(getQuery(event).path ?? '').trim()
  const empty = { links: [] as PathItem[], quotes: [] as PathItem[], sources: [] as PathItem[] }
  if (!path.startsWith('/')) return empty

  const collection = collectionForPath(path)
  if (!collection) return empty

  const today = todayIso()

  // `as never` is the established project pattern for dynamic collection names
  // (see server/api/health.get.ts). The doc-lookup only needs referenceCodes/quoteCodes/primarySources;
  // we drop .select() here because the cast makes field-level narrowing unreliable anyway.
  const doc = await queryCollection(event, collection as never)
    .path(path)
    .first() as { referenceCodes?: string[], quoteCodes?: string[], primarySources?: { code?: string }[] } | null

  if (!doc) return empty

  const referenceCodes = [
    ...(doc.referenceCodes || []),
    ...(doc.primarySources || []).map((s: { code?: string }) => s.code).filter((c): c is string => Boolean(c)),
  ]
  const quoteCodes = doc.quoteCodes || []

  let linksQ = referenceCodes.length
    ? queryCollection(event, 'quellenlinks')
        .orWhere((q) => {
          for (const code of referenceCodes) q.where('code', '=', code)
          return q
        })
        .select('date', 'sourceDate', 'publishedOn', 'title', 'code', 'uri', 'type', 'path', 'tags', 'coSources')
    : null
  if (linksQ && !preview) linksQ = linksQ.where('publishedOn', '<=', today)
  const links: PathItem[] = linksQ ? await linksQ.all() as unknown as PathItem[] : []

  // zitate records are small; skip select() to avoid field-narrowing issues with the cast
  let quotesQ = quoteCodes.length
    ? queryCollection(event, 'zitate')
        .orWhere((q) => {
          for (const code of quoteCodes) q.where('code', '=', code)
          return q
        })
    : null
  if (quotesQ && !preview) quotesQ = quotesQ.where('publishedOn', '<=', today)
  const quotes: PathItem[] = quotesQ ? await quotesQ.all() as unknown as PathItem[] : []

  const sourcePaths = [
    ...new Set([
      ...links.map(l => buildSourcePath(l.path)),
      ...quotes.map(q => buildSourcePath(q.path)),
    ]),
  ]

  // quellen records are small; skip select() to avoid field-narrowing issues with the cast
  const sources: PathItem[] = sourcePaths.length
    ? await queryCollection(event, 'quellen')
      .where('path', 'IN', sourcePaths)
      .all() as unknown as PathItem[]
    : []

  return { links, quotes, sources }
})
