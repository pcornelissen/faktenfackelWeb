import { useNuxtApp } from 'nuxt/app'
import { reactive } from 'vue'
import type { Quote } from '~/utils/contentUtils'

export type Source = {
  date: string
  publishedOn: string | null
  name: string
  description: string
  path: string
  tags: string[]
  imageAuthor?: string | null
}
export type SourceLink = {
  date: string
  sourceDate: string
  publishedOn: string | null
  title: string
  code: string
  uri: string
  type: string
  path: string
  tags: string[]
  coSources: string[]
}

type PageWithCodes = {
  path?: string
  referenceCodes?: string[]
  quoteCodes?: string[]
  primarySources?: {
    code?: string
  }[]
}

type ReferencesStore = ReturnType<typeof createReferencesStore>

export function buildSourcePath(path: string) {
  const segments = path.split('/')
  return '/quellen/' + segments[2] + '/' + segments[3]
}

function createReferencesStore() {
  return reactive({
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
        date: '', sourceDate: '', publishedOn: '', code: '', uri: '', type: '', path: '', tags: [], coSources: [],
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
        date: '', publishedOn: '', description: '', path: '', tags: [], imageAuthor: '',
      }
    },
    async fetchFor(page: PageWithCodes | null | undefined) {
      this.links.clear()
      this.quotes.clear()
      this.sources.clear()
      const path = page?.path
      if (!path) return
      const data = await $fetch<{ links: SourceLink[], quotes: Quote[], sources: Source[] }>('/api/references', {
        query: { path },
      })
      for (const link of data.links) this.links.set(link.code, link)
      for (const quote of data.quotes) this.quotes.set(quote.code, quote)
      for (const source of data.sources) this.sources.set(source.path, source)
    },
  })
}

export function useReferencesStore(): ReferencesStore {
  const nuxtApp = useNuxtApp()
  if (!nuxtApp._referencesStore) {
    nuxtApp._referencesStore = createReferencesStore()
  }
  return nuxtApp._referencesStore as ReferencesStore
}
