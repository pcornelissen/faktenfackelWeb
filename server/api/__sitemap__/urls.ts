import { defineEventHandler } from 'h3'
import { queryCollection } from '@nuxt/content/server'

export default defineEventHandler(async (e) => {
  const [faktenchecks, lagerfeuer, glossar, zitate, quellenlinks] = await Promise.all([
    queryCollection(e, 'faktenchecks').select('path', 'date').all(),
    queryCollection(e, 'lagerfeuer').select('path', 'date').all(),
    queryCollection(e, 'glossar').select('path', 'date').all(),
    queryCollection(e, 'zitate').select('path', 'date').all(),
    queryCollection(e, 'quellenlinks').select('path', 'date').all(),
  ])

  return [
    ...faktenchecks,
    ...lagerfeuer,
    ...glossar,
    ...zitate,
    ...quellenlinks,
  ]
    .filter(p => p.path && p.date)
    .map(p => ({
      loc: p.path,
      lastmod: String(p.date),
    }))
})
