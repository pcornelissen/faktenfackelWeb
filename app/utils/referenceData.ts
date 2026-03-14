import { reactive } from 'vue'
import { nowIso } from '~/utils/contentUtils'

export type Source = {
  date: string
  name: string
  description: string
  path: string
  tags: string[]
  imageAuthor?: string | null
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

type PageWithCodes = {
  referenceCodes?: string[]
  quoteCodes?: string[]
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
      date: '', description: '', path: '', tags: [], imageAuthor: '',
    }
  },
  async fetchFor(page: PageWithCodes | null | undefined) {
    const referenceCodes = page?.referenceCodes || []
    const quoteCodes = page?.quoteCodes || []
    const sourceLinks: SourceLink[] = referenceCodes.length
      ? await queryCollection('quellenlinks').where('code', 'IN', referenceCodes).where('date', '<=', nowIso()).all() as SourceLink[]
      : []

    const quotes: Quote[] = quoteCodes.length
      ? await queryCollection('zitate').where('code', 'IN', quoteCodes).where('date', '<=', nowIso()).all() as Quote[]
      : []

    this.links.clear()
    this.quotes.clear()
    this.sources.clear()

    for (const link of sourceLinks) {
      this.links.set(link.code, link)
    }
    for (const quote of quotes) {
      this.quotes.set(quote.code, quote)
    }
    await this.updateSources()
  },

  async updateSources() {
    const sourcePaths = [
      ...new Set([
        ...this.links.values().map(l => buildSourcePath(l.path)),
        ...this.quotes.values().map(l => buildSourcePath(l.path)),
      ]),
    ]
    if (this.links.size + this.quotes.size === 0) return

    const sources = await queryCollection('quellen').where('path', 'IN', sourcePaths).all() as Source[]

    for (const source of sources) {
      this.sources.set(source.path, source)
    }
  },
})
