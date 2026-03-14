import { defineEventHandler } from 'h3'
import { queryCollection } from '@nuxt/content/server'

export default defineEventHandler(async (e) => {
  const now = new Date().toISOString()
  const [faktenchecks, lagerfeuer, glossar, zitate, quellenlinks, quellen] = await Promise.all([
    queryCollection(e, 'faktenchecks').select('path', 'date').where('date', '<=', now).all(),
    queryCollection(e, 'lagerfeuer').select('path', 'date').where('date', '<=', now).all(),
    queryCollection(e, 'glossar').select('path', 'date').where('date', '<=', now).all(),
    queryCollection(e, 'zitate').select('path', 'date').where('date', '<=', now).all(),
    queryCollection(e, 'quellenlinks').select('path', 'date').where('date', '<=', now).all(),
    queryCollection(e, 'quellen').select('path', 'date').where('date', '<=', now).all(),
  ])

  return [
    ...faktenchecks,
    ...lagerfeuer,
    ...glossar,
    ...zitate,
    ...quellenlinks,
    ...quellen,
  ]
    .filter(p => p.path && p.date)
    .map(p => ({
      loc: p.path,
      lastmod: String(p.date),
    }))
})
