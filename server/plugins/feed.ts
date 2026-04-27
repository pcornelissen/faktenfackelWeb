import { queryCollection } from '@nuxt/content/server'
import type { H3Event } from 'h3'

const SITE_URL = 'https://faktenfackel.de'
const FEED_ROUTES = new Set(['/feed.xml', '/feed.json'])
const FEED_COLLECTIONS = ['faktenchecks', 'lagerfeuer', 'glossar'] as const

type FeedmeHandleOptions = {
  context: {
    event: H3Event
    routeSettings: { feed?: FeedOptions }
  }
  feed: {
    obtain: (options?: FeedOptions) => {
      addItem: (item: FeedItem) => void
    }
  }
}

type FeedmeHooks = {
  hook: (name: 'feedme:handle', cb: (options: FeedmeHandleOptions) => Promise<void>) => void
}

type FeedContentItem = {
  path?: string
  title?: string
  description?: string
  subtitle?: string
  subject?: string
  teaser?: string
  publishedOn?: string | Date | null
  date?: string | Date | null
}

type FeedOptions = Record<string, unknown>

type FeedItem = {
  title: string
  id: string
  link: string
  description?: string
  date: Date
  published: Date
}

function toAbsoluteUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

function toDate(value: unknown): Date | undefined {
  if (!value) return undefined
  if (value instanceof Date) return value
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? undefined : date
}

export default defineNitroPlugin((nitroApp) => {
  const hooks = nitroApp.hooks as unknown as FeedmeHooks

  hooks.hook('feedme:handle', async ({ context, feed }) => {
    if (!FEED_ROUTES.has(context.event.path)) return

    const now = new Date().toISOString()
    const rawItems: FeedContentItem[] = []

    for (const collection of FEED_COLLECTIONS) {
      const items = await queryCollection(context.event, collection)
        .where('path', 'NOT LIKE', '%/_info')
        .where('publishedOn', '<=', now)
        .all()

      rawItems.push(...items as FeedContentItem[])
    }

    const feedItems = rawItems
      .map((raw): FeedItem | undefined => {
        if (!raw.path || raw.path.endsWith('/_info')) return undefined

        const published = toDate(raw.publishedOn) || toDate(raw.date)
        if (!published) return undefined

        const link = toAbsoluteUrl(raw.path)
        const title = raw.title || raw.subject || raw.path
        const description = raw.description || raw.subtitle || raw.subject || raw.teaser

        return {
          title,
          id: link,
          link,
          description,
          date: published,
          published,
        }
      })
      .filter((item): item is FeedItem => Boolean(item))
      .sort((a, b) => b.date.getTime() - a.date.getTime())

    const currentFeed = feed.obtain(context.routeSettings.feed)
    for (const item of feedItems) {
      currentFeed.addItem(item)
    }
  })
})
