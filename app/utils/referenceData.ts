import { reactive } from 'vue'
import { type MinimarkTree, visit } from 'minimark'

export type Source = {
  date: string
  name: string
  description: string
  path: string
  tags: string[]
  image: string | null
  imageAuthor: string | null
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

export function extractCodes(body: MinimarkTree | undefined): string[] {
  if (body === undefined) return []
  const result: string[] = []
  visit(body, node => node[0] === 'reference', (node) => {
    result.push(node[1].code as string)
  })

  return result
}

function buildSourcePath(path: string) {
  const segments = path.split('/')
  return '/quellen/' + segments[2] + '/' + segments[3]
}

export const referencesStore = reactive({
  sources: new Map<string, Source>(),
  links: new Map<string, SourceLink>(),
  hasLinkForCode(code: string) {
    return this.links.has(code)
  },
  hasSourceFor(path: string) {
    return this.sources.has(buildSourcePath(path))
  },
  linkByCode(code: string): SourceLink {
    return this.links.get(code) || {
      title: code + ' not found',
      date: '', code: '', uri: '', type: '', path: '', tags: [], coSources: [],
    }
  },
  sourceByLinkPath(path: string): Source {
    return this.sources.get(buildSourcePath(path)) || {
      name: path + ' not found',
      date: '', description: '', path: '', tags: [], image: '', imageAuthor: '',
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
      .map(l => buildSourcePath(l.path)))
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
    console.log('Sources updated', this.sources.size, 'sources found')
  },
})
