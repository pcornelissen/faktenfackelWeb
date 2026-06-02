import { defineEventHandler, getQuery, setHeader } from 'h3'
import { queryCollection } from '@nuxt/content/server'
import { isCollection } from '~~/server/utils/contentRoutes'
import { isPreview, todayIso } from '~~/server/utils/published'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800')

  const query = getQuery(event)
  const collection = String(query.collection ?? '').trim()
  const scope = String(query.scope ?? '').trim()
  const value = String(query.value ?? '').trim()
  const limitRaw = String(query.limit ?? '').trim()
  const fieldsRaw = String(query.fields ?? '').trim()
  const fields = fieldsRaw ? fieldsRaw.split(',').map(f => f.trim()).filter(Boolean) : null

  if (!isCollection(collection)) return []

  const siteEnv = String(useRuntimeConfig(event).public.siteEnv ?? '')
  const preview = isPreview(siteEnv)
  const t = todayIso()

  function applySelect(q: ReturnType<typeof queryCollection>) {
    return fields ? q.select(...(fields as [never, ...never[]])) : q
  }

  if (scope === 'recent') {
    const limit = Number(limitRaw) || 6
    let q = queryCollection(event, collection as never)
      .where('path', 'NOT LIKE', '%_info%')
      .order('date', 'DESC')
      .limit(limit)
    if (!preview) q = q.where('publishedOn', '<=', t)
    return await applySelect(q).all()
  }

  if (scope === 'prefix') {
    if (!value) return []
    let q = queryCollection(event, collection as never)
      .where('path', 'LIKE', value + '/%')
      .where('path', 'NOT LIKE', '%_info%')
      .order('date', 'DESC')
    if (!preview) q = q.where('publishedOn', '<=', t)
    return await applySelect(q).all()
  }

  if (scope === 'all') {
    let q = queryCollection(event, collection as never)
      .where('path', 'NOT LIKE', '%_info%')
      .order('date', 'DESC')
    if (!preview) q = q.where('publishedOn', '<=', t)
    return await applySelect(q).all()
  }

  // Returns _info pages under a given path prefix, ordered by title ASC
  if (scope === 'infos') {
    const prefix = value || ''
    const q = prefix
      ? queryCollection(event, collection as never)
          .where('path', 'LIKE', prefix + '/%/_info')
          .order('title', 'ASC')
      : queryCollection(event, collection as never)
          .where('path', 'LIKE', '%/_info')
          .order('title', 'ASC')
    return await applySelect(q).all()
  }

  if (scope === 'paths') {
    if (!value) return []
    const paths = value.split(',').map(p => p.trim()).filter(Boolean)
    if (!paths.length) return []
    const q = queryCollection(event, collection as never)
      .where('path', 'IN', paths)
    return await applySelect(q).all()
  }

  if (scope === 'slug') {
    if (!value) return []
    let q = queryCollection(event, collection as never)
      .where('path', 'LIKE', '%/' + value)
    if (!preview) q = q.where('publishedOn', '<=', t)
    return await applySelect(q).all()
  }

  if (scope === 'slugs') {
    if (!value) return []
    const slugList = value.split(',').map(s => s.trim()).filter(Boolean)
    if (!slugList.length) return []
    let q = queryCollection(event, collection as never)
      .orWhere((q) => {
        for (const s of slugList) {
          q.where('path', 'LIKE', '%/' + s)
        }
        return q
      })
    if (!preview) q = q.where('publishedOn', '<=', t)
    return await applySelect(q).all()
  }

  return []
})
