import { defineEventHandler } from 'h3'
import { queryCollection } from '@nuxt/content/server'

function maxDate(items: Array<{ date?: string | Date | null }>): string | null {
  const ts = items
    .map(i => i.date ? new Date(i.date).getTime() : 0)
    .filter(t => t > 0)
  if (!ts.length) return null
  return new Date(Math.max(...ts)).toISOString()
}

export default defineEventHandler(async (e) => {
  const now = new Date().toISOString()
  const [faktenchecks, lagerfeuer, glossar, zitate, quellenlinks, quellen, news] = await Promise.all([
    queryCollection(e, 'faktenchecks').select('path', 'date', 'publishedOn').where('publishedOn', '<=', now).all(),
    queryCollection(e, 'lagerfeuer').select('path', 'date', 'publishedOn').where('publishedOn', '<=', now).all(),
    queryCollection(e, 'glossar').select('path', 'date', 'publishedOn').where('publishedOn', '<=', now).all(),
    queryCollection(e, 'zitate').select('path', 'date', 'publishedOn').where('publishedOn', '<=', now).all(),
    queryCollection(e, 'quellenlinks').select('path', 'date', 'publishedOn').where('publishedOn', '<=', now).all(),
    queryCollection(e, 'quellen').select('path', 'date', 'publishedOn').where('publishedOn', '<=', now).all(),
    queryCollection(e, 'news').select('path', 'date', 'publishedOn').where('publishedOn', '<=', now).all(),
  ])

  const contentEntries = [
    ...faktenchecks,
    ...lagerfeuer,
    ...glossar,
    ...zitate,
    ...quellenlinks,
    ...quellen,
    ...news,
  ]
    .filter(p => p.path && p.date && !p.path.endsWith('/_info'))
    .map(p => ({
      loc: p.path,
      lastmod: String(p.date),
    }))

  const homeLastmod = maxDate([...faktenchecks, ...lagerfeuer, ...news])
  const indexEntries: { loc: string, lastmod: string }[] = []
  const pushIndex = (loc: string, lastmod: string | null) => {
    if (lastmod) indexEntries.push({ loc, lastmod })
  }
  pushIndex('/', homeLastmod)
  pushIndex('/faktenchecks/', maxDate(faktenchecks))
  pushIndex('/lagerfeuer/', maxDate(lagerfeuer))
  pushIndex('/glossar/', maxDate(glossar))
  pushIndex('/quellen/', maxDate([...quellen, ...quellenlinks]))
  pushIndex('/zitate/', maxDate(zitate))
  pushIndex('/news/', maxDate(news))

  return [...indexEntries, ...contentEntries]
})
