import { defineEventHandler, getQuery } from 'h3'
import { queryCollection } from '@nuxt/content/server'
import { isCollection } from '~~/server/utils/contentRoutes'
import { isPreview, todayIso, setContentCache } from '~~/server/utils/published'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const collection = String(query.collection ?? '').trim()
  const path = String(query.path ?? '').trim()

  const preview = isPreview(String(useRuntimeConfig(event).public.siteEnv ?? ''))
  setContentCache(event, preview)

  if (!isCollection(collection) || !path.startsWith('/')) return null

  const doc = await queryCollection(event, collection as never)
    .path(path)
    .first() as Record<string, unknown> | null

  if (!doc) return null

  // Scheduled publishing: if publishedOn is set and in the future, treat as not found.
  // On dev (siteEnv='dev') this filter is skipped so drafts/future items are visible.
  if (!preview && doc.publishedOn && typeof doc.publishedOn === 'string' && doc.publishedOn > todayIso()) {
    return null
  }

  return doc
})
