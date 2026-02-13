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
  visit(body, node => node[0] === 'quote-reference', (node) => {
    const name = 'quote-' + (node[1].code as string)
    if (result.indexOf(name) === -1) {
      result.push(name)
    } else {
      console.error('Duplicate code found: ' + name)
    }
  })

  return result
}

export function buildSourcePath(path: string) {
  const segments = path.split('/')
  return '/quellen/' + segments[2] + '/' + segments[3]
}

export const referencesStore = reactive({
  sources: new Map<string, Source>(),
  links: new Map<string, SourceLink>(),
  quotes: new Map<string, Quote>(),

  hasQuoteForCode(code: string) {
    return this.quotes.has(code)
  },
  hasLinkForCode(code: string) {
    return this.links.has(code)
  },
  hasSourceFor(path: string) {
    console.log('Checking source for path', path, 'with built path', buildSourcePath(path), this.sources.has(buildSourcePath(path)), this.sources)
    return this.sources.has(buildSourcePath(path))
  },
  linkByCode(code: string): SourceLink {
    return this.links.get(code) || {
      title: code + ' not found',
      date: '', code: '', uri: '', type: '', path: '', tags: [], coSources: [],
    }
  },
  quoteByCode(code: string): Quote {
    return this.quotes.get(code) || {
      title: code + ' not found',
      date: '', code: '', uri: '', type: '', path: '', tags: [], teaser: '', publishedOn: '',
    } as Quote
  },
  sourceByLinkPath(path: string): Source {
    return this.sources.get(buildSourcePath(path)) || {
      name: path + ' not found',
      date: '', description: '', path: '', tags: [], image: '', imageAuthor: '',
    }
  },

  async fetchFor(links: string[] | undefined) {
    const codes = new Set<string>(links || [])
    const { data: sourceLinksRaw }
      = await
      useAsyncData(
        `quellenlinks-for-page`,
        () => {
          return queryCollection('quellenlinks')
            .orWhere(
              (query) => {
                codes.forEach((s) => {
                  if (!s.startsWith('quote-')) {
                    query = query.where('code', '=', s)
                  }
                })
                return query
              },
            ).all()
        })
    const { data: quotesRaw }
      = await
      useAsyncData(
        `zitate-for-page`,
        () => {
          return queryCollection('zitate')
            .orWhere(
              (query) => {
                codes.forEach((s) => {
                  if (s.startsWith('quote-')) {
                    query = query.where('code', '=', s.replace('quote-', ''))
                  }
                })
                return query
              },
            ).all()
        })
    const sourceLinks = sourceLinksRaw.value as SourceLink[]
    const quotes = quotesRaw.value as Quote[]
    this.links.clear()
    this.quotes.clear()
    this.sources.clear()

    for (const link of (sourceLinks || []) as SourceLink[]) {
      this.links.set(link.code, link)
    }
    for (const quote of (quotes || []) as Quote[]) {
      this.quotes.set(quote.code, quote)
    }
    console.log('links', this.links)
    console.log('quotes', this.quotes)
    await useAsyncData(
      `update-sources`,
      () => this.updateSources())
  },

  async updateSources() {
    const sourcePaths = new Set([
      ...this.links.values().map(l => buildSourcePath(l.path)),
      ...this.quotes.values().map(l => buildSourcePath(l.path)),
    ])
    const { data: sourcesByLinksRaw }
      = (this.links?.size + this.quotes?.size > 0)
        ? await useAsyncData('reference-sources', () => {
            const builder = queryCollection('quellen').orWhere(
              (query) => {
                sourcePaths.forEach((s) => {
                  console.log('Adding source path to query: ' + s)
                  query = query.where('path', '=', s)
                })
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
