import { useRoute } from 'nuxt/app'
import { nextTick } from 'vue'

interface PageData {
  title: string
  pageHeading?: string
  pageSubHeading?: string
  description?: string
  lastmod?: Date
  sitemap?: false | {
    priority: 0.8
    changefreq: 'daily'
  }
}

export function filter(list: Post[], category: string, sectionName: string = 'faktenchecks') {
  const prefix = `/${sectionName}/${category}/`
  return list
    .filter(item => !item.path.endsWith(`/_info`))
    .filter(item => item.path.startsWith(prefix))
}

export async function definePageData(data: PageData) {
  definePageMeta({
    title: '',
    pageHeading: '',
    pageSubHeading: '',
    description: '',
    sitemap: data.sitemap ?? {
      priority: 0.8,
      changefreq: 'daily',
    },
  })
  if (data.title)
    useRoute().meta.title = data.title
  if (data.pageHeading)
    useRoute().meta.pageHeading = data.pageHeading
  if (data.pageSubHeading)
    useRoute().meta.pageSubHeading = data.pageSubHeading
  if (data.description)
    useRoute().meta.description = data.description
  await nextTick()
}

export type Post = {
  title: string
  subject: string
  subtitle: string
  verdict: 'false' | 'misleading' | 'complex' | 'true' | undefined
  description: string | undefined
  icon: string | undefined
  path: string
  tags: string[]
  date: string
  publishedOn: string
  part: number | undefined
}

export type Quote = {
  title: string
  code: string
  teaser: string
  path: string
  tags: string[]
  date: string
  publishedOn: string
}

export function getSourceFromPath(path: string) {
  return path.split('/').slice(0, 4).join('/')
}

/** Current UTC datetime as ISO 8601 string for date-gate WHERE clauses.
 *  In development mode, returns a far-future date so future-dated content is always visible. */
export function nowIso(): string {
  if (import.meta.dev) return '9999-12-31T23:59:59.999Z'
  return new Date().toISOString()
}
