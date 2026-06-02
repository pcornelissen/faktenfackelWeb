import { defineEventHandler, getQuery, setHeader } from 'h3'
import { queryCollectionItemSurroundings } from '@nuxt/content/server'
import { isCollection } from '~~/server/utils/contentRoutes'
import { isPreview, todayIso } from '~~/server/utils/published'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800')

  const query = getQuery(event)
  const collection = String(query.collection ?? '').trim()
  const path = String(query.path ?? '').trim()
  const prefix = String(query.prefix ?? '').trim()

  if (!isCollection(collection) || !path.startsWith('/')) return [null, null]

  const siteEnv = String(useRuntimeConfig(event).public.siteEnv ?? '')

  let surroundings = queryCollectionItemSurroundings(event, collection as never, path, {})

  if (prefix) {
    surroundings = surroundings.where('path', 'LIKE', prefix + '/%')
  }

  if (!isPreview(siteEnv)) {
    surroundings = surroundings.where('publishedOn', '<=', todayIso())
  }

  return await surroundings
})
