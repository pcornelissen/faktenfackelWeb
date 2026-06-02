import { defineEventHandler, getQuery, setHeader } from 'h3'
import { queryCollection } from '@nuxt/content/server'
import { isCollection, today } from '~~/server/utils/contentRoutes'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800')

  const query = getQuery(event)
  const collection = String(query.collection ?? '').trim()
  const scope = String(query.scope ?? '').trim()
  const value = String(query.value ?? '').trim()
  const limitRaw = String(query.limit ?? '').trim()

  if (!isCollection(collection)) return []

  const t = today()

  if (scope === 'recent') {
    const limit = Number(limitRaw) || 6
    return await queryCollection(event, collection as never)
      .where('publishedOn', '<=', t)
      .where('path', 'NOT LIKE', '%_info%')
      .order('date', 'DESC')
      .limit(limit)
      .all()
  }

  if (scope === 'prefix') {
    if (!value) return []
    return await queryCollection(event, collection as never)
      .where('path', 'LIKE', value + '/%')
      .where('path', 'NOT LIKE', '%_info%')
      .where('publishedOn', '<=', t)
      .order('date', 'DESC')
      .all()
  }

  if (scope === 'all') {
    return await queryCollection(event, collection as never)
      .where('publishedOn', '<=', t)
      .where('path', 'NOT LIKE', '%_info%')
      .order('date', 'DESC')
      .all()
  }

  if (scope === 'paths') {
    if (!value) return []
    const paths = value.split(',').map(p => p.trim()).filter(Boolean)
    if (!paths.length) return []
    return await queryCollection(event, collection as never)
      .where('path', 'IN', paths)
      .all()
  }

  if (scope === 'slug') {
    if (!value) return []
    return await queryCollection(event, collection as never)
      .where('path', 'LIKE', '%/' + value)
      .where('publishedOn', '<=', t)
      .all()
  }

  if (scope === 'slugs') {
    if (!value) return []
    const slugList = value.split(',').map(s => s.trim()).filter(Boolean)
    if (!slugList.length) return []
    return await queryCollection(event, collection as never)
      .orWhere((q) => {
        for (const s of slugList) {
          q.where('path', 'LIKE', '%/' + s)
        }
        return q
      })
      .where('publishedOn', '<=', t)
      .all()
  }

  return []
})
