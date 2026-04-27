import { defineEventHandler, setHeader } from 'h3'
import { queryCollection, queryCollectionNavigation, queryCollectionSearchSections } from '@nuxt/content/server'

export default defineEventHandler(async (e) => {
  setHeader(e, 'Cache-Control', 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400')

  const [
    navigation,
    files,
    fcFm,
    glFm,
    qlFm,
    lfFm,
    quFm,
    ziFm,
  ] = await Promise.all([
    Promise.all([
      queryCollectionNavigation(e, 'faktenchecks'),
      queryCollectionNavigation(e, 'glossar'),
      queryCollectionNavigation(e, 'quellen'),
      queryCollectionNavigation(e, 'quellenlinks'),
      queryCollectionNavigation(e, 'lagerfeuer'),
      queryCollectionNavigation(e, 'zitate'),
    ]).then(r => r.flat()),
    Promise.all([
      queryCollectionSearchSections(e, 'faktenchecks'),
      queryCollectionSearchSections(e, 'glossar'),
      queryCollectionSearchSections(e, 'quellen'),
      queryCollectionSearchSections(e, 'quellenlinks'),
      queryCollectionSearchSections(e, 'lagerfeuer'),
      queryCollectionSearchSections(e, 'zitate'),
    ]).then(r => r.flat()),
    queryCollection(e, 'faktenchecks').select('path', 'subtitle', 'tags').all(),
    queryCollection(e, 'glossar').select('path', 'subject', 'tags').all(),
    queryCollection(e, 'quellenlinks').select('path', 'tags').all(),
    queryCollection(e, 'lagerfeuer').select('path', 'subtitle', 'tags').all(),
    queryCollection(e, 'quellen').select('path', 'description', 'tags').all(),
    queryCollection(e, 'zitate').select('path', 'teaser', 'tags').all(),
  ])

  const frontMatter: Record<string, string> = {}
  for (const item of [...fcFm, ...glFm, ...qlFm, ...lfFm, ...quFm, ...ziFm]) {
    const r = item as Record<string, unknown>
    const tags = (r.tags as string[] | undefined)?.join(' ')
    const extra = [r.subtitle, r.subject, r.description, r.teaser, tags]
      .filter(Boolean)
      .join(' ')
    if (extra) frontMatter[item.path] = extra
  }

  return { navigation, files, frontMatter }
})
