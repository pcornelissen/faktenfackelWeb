import { defineEventHandler, getQuery, setHeader } from 'h3'
import { queryCollection } from '@nuxt/content/server'
import { isCollection, today } from '~~/server/utils/contentRoutes'

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

  // Scheduled publishing: if publishedOn is set and in the future, treat as not found
  if (doc.publishedOn && typeof doc.publishedOn === 'string' && doc.publishedOn > today()) {
    return null
  }

  return doc
})
