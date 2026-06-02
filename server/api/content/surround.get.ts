import { defineEventHandler, getQuery } from 'h3'
import { queryCollectionItemSurroundings } from '@nuxt/content/server'
import { isCollection } from '~~/server/utils/contentRoutes'
import { isPreview, todayIso, setContentCache } from '~~/server/utils/published'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const collection = String(query.collection ?? '').trim()
  const path = String(query.path ?? '').trim()
  const prefix = String(query.prefix ?? '').trim()

  const preview = isPreview(String(useRuntimeConfig(event).public.siteEnv ?? ''))
  setContentCache(event, preview)

  if (!isCollection(collection) || !path.startsWith('/')) return [null, null]
  // LIKE-Wildcards (% _ \) im prefix abweisen — kommen in echten Pfaden nicht vor.
  if (prefix && /[%_\\]/.test(prefix)) return [null, null]

  let surroundings = queryCollectionItemSurroundings(event, collection as never, path, {})

  if (prefix) {
    surroundings = surroundings.where('path', 'LIKE', prefix + '/%')
  }

  if (!preview) {
    surroundings = surroundings.where('publishedOn', '<=', todayIso())
  }

  return await surroundings
})
