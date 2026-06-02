import { defineEventHandler, getQuery, setHeader } from 'h3'
import { queryCollection } from '@nuxt/content/server'
import { isCollection } from '~~/server/utils/contentRoutes'
import { isPreview, todayIso } from '~~/server/utils/published'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800')

  const query = getQuery(event)
  const collection = String(query.collection ?? '').trim()
  const path = String(query.path ?? '').trim()

  if (!isCollection(collection) || !path.startsWith('/')) return null

  const doc = await queryCollection(event, collection as never)
    .path(path)
    .first() as Record<string, unknown> | null

  if (!doc) return null

  // Scheduled publishing: if publishedOn is set and in the future, treat as not found.
  // On dev (siteEnv='dev') this filter is skipped so drafts/future items are visible.
  const siteEnv = String(useRuntimeConfig(event).public.siteEnv ?? '')
  if (!isPreview(siteEnv) && doc.publishedOn && typeof doc.publishedOn === 'string' && doc.publishedOn > todayIso()) {
    return null
  }

  return doc
})
