import { defineEventHandler, getQuery, setHeader } from 'h3'
import { queryCollectionItemSurroundings } from '@nuxt/content/server'
import { isCollection, today } from '~~/server/utils/contentRoutes'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800')

  const query = getQuery(event)
  const collection = String(query.collection ?? '').trim()
  const path = String(query.path ?? '').trim()
  const prefix = String(query.prefix ?? '').trim()

  if (!isCollection(collection) || !path.startsWith('/')) return [null, null]

  let surroundings = queryCollectionItemSurroundings(event, collection as never, path, {})

  if (prefix) {
    surroundings = surroundings.where('path', 'LIKE', prefix + '/%')
  }

  surroundings = surroundings.where('publishedOn', '<=', today())

  return await surroundings
})
