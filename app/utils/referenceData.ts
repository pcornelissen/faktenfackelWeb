import { reactive } from 'vue'

export type Source = {
  date: string
  name: string
  description: string
  path: string
  tags: string[]
  image: string | null
}
export type SourceLink = {
  date: string
  title: string
  code: string
  uri: string
  type: string
  path: string
  tags: string[]
  coSources: string[]
}

export const referencesStore = reactive({
  sources: new Map<string, Source>(),
  links: new Map<string, SourceLink>(),
  hasLinkForCode(code: string) {
    return this.links.has(code)
  },
  hasSourceFor(path: string) {
    return this.sources.has('/quellen/' + path.split('/')[2] + '/' + path.split('/')[3])
  },
  linkByCode(code: string): SourceLink {
    return this.links.get(code) || {
      title: code + ' not found',
      date: '', code: '', uri: '', type: '', path: '', tags: [], coSources: [],
    }
  },
  sourceByLinkPath(path: string): Source {
    return this.sources.get('/quellen/' + path.split('/')[2] + '/' + path.split('/')[3]) || {
      name: path + ' not found',
      date: '', description: '', path: '', tags: [], image: '',
    }
  },

  async fetchFor(links: string[] | undefined) {
    const sourceLinkCodes = new Set<string>(links || [])
    const { data: sourceLinksRaw }
      = await
      useAsyncData(
        `quellenlinks-for-page`,
        () => {
          return queryCollection('quellenlinks')
            .orWhere(
              (query) => {
                sourceLinkCodes.forEach(s => query = query.where('code', '=', s))
                return query
              },
            ).all()
        })
    const sourceLinks = sourceLinksRaw.value as SourceLink[]
    this.links.clear()
    this.sources.clear()

    for (const link of (sourceLinks || []) as SourceLink[]) {
      this.links.set(link.code, link)
    }
    await useAsyncData(
      `update-sources`,
      () => this.updateSources())
  },

  async updateSources() {
    const sourcePaths = new Set([...this.links.values()]
      .map(l => '/quellen/' + l.path.split('/')[2] + '/' + l.path.split('/')[3]))
    const { data: sourcesByLinksRaw }
      = (this.links?.size > 0)
        ? await useAsyncData('sourcelink-sources', () => {
            const builder = queryCollection('quellen').orWhere(
              (query) => {
                sourcePaths.forEach(s => query = query.where('path', '=', s))
                return query
              },
            )
            return builder
              .all()
          })
        : { data: { value: [] } }
    for (const source of (sourcesByLinksRaw?.value || []) as Source[]) {
      this.sources.set(source.path, source)
    }
  },
})
