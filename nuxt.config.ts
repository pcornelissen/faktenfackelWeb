/// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'

const isDev = process.env.NODE_ENV !== 'production'
const lifecycleEvent = process.env.npm_lifecycle_event ?? ''
const isDevCommand = lifecycleEvent === 'dev' || process.argv.includes('dev')
const contentDatabaseFile = isDevCommand
  ? './.data/content/dev.sqlite'
  : './.data/content/build.sqlite'
const nitroPreset = isDevCommand ? 'node_server' : 'cloudflare_module'

export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/fonts',
    '@nuxt/scripts',
    '@nuxtjs/sitemap',
    'nuxt-feedme',
    'nuxt-og-image',
  ],
  $production: {
    routeRules: {
      '/faktenchecks/**': { swr: 3600, headers: { 'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400' } },
      '/lagerfeuer/**': { swr: 3600, headers: { 'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400' } },
      '/zitate/**': { swr: 3600, headers: { 'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400' } },
      '/quellen/**': { swr: 3600, headers: { 'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400' } },
      '/tags/**': { swr: 3600, headers: { 'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400' } },
      '/glossar/**': { swr: 86400, headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800' } },
      '/news/**': { swr: 3600, headers: { 'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400' } },
    },
  },
  components: [
    { path: '~/components', pathPrefix: false },
  ],
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  css: ['~/assets/css/main.css'],
  site: {
    url: 'https://faktenfackel.de',
    name: 'Faktenfackel - Faktenchecks zu aktuellen Themen',
    trailingSlash: true,
  },
  colorMode: {
    preference: 'light',
  },
  content: {
    database: {
      type: 'sqlite',
      filename: contentDatabaseFile,
    },
    build: {
      markdown: {
        toc: {
          depth: 3,
          searchDepth: 3,
        },
      },
    },
  },
  ui: {
    theme: {
      colors: [
        'orange',
        'stone',
      ],
    },
  },
  routeRules: {
    '/': { prerender: true },
    '/about': { prerender: true },
    '/faq': { prerender: true },
    '/impressum': { prerender: true },
    '/datenschutz': { prerender: true },
    '/mehr': { prerender: true },
    '/news': { prerender: true },
  },
  sourcemap: {
    server: false,
    client: false,
  },
  features: {
    inlineStyles: true,
  },
  compatibilityDate: '2026-03-01',
  nitro: {
    // In dev, images are served by server/middleware/quellen-img.ts instead.
    // publicAssets with cloudflare-dev emulation returns 426 in dev mode.
    publicAssets: isDev
      ? []
      : [
          {
            dir: fileURLToPath(new URL('./content/quellen', import.meta.url)),
            baseURL: '/quellen-img',
            maxAge: 60 * 60 * 24 * 365,
          },
        ],
    preset: nitroPreset,
    esbuild: {
      options: {
        logOverride: { 'duplicate-object-key': 'silent' },
      },
    },
    cloudflare: {
      deployConfig: true,
      wrangler: {
        observability: {
          logs: {
            enabled: true,
            head_sampling_rate: 1,
            invocation_logs: true,
          },
        },
        d1_databases: [{
          binding: 'DB',
          database_name: 'fackel1',
          database_id: '6dc09d29-36fe-4193-8dbd-7479b5ade6ae',
        }],
        name: 'faktenfackel',
      },
    },
  },
  vite: {
    build: {
      chunkSizeWarningLimit: 600,
    },
  },
  typescript: {
    tsConfig: {
      compilerOptions: {
        types: ['node'], // means including @types/node
      },
    },
  },
  hooks: {
    'content:file:afterParse'(ctx) {
      const { file, content } = ctx

      const wordsPerMinute = 180
      const text = file.body
      const wordCount = text.split(/\s+/).length
      content.readingTime = Math.ceil(wordCount / wordsPerMinute)

      // date-Feld als sitemap.lastmod verfügbar machen
      if (content.date) {
        const sitemap = (content.sitemap as Record<string, unknown>) || {}
        sitemap.lastmod = content.date
        content.sitemap = sitemap
      }

      // Referenz-Codes aus dem Rohtext extrahieren (für referencesStore)
      const referenceCodes = [
        ...[...text.matchAll(/<[Ss]ource[Rr]ef\b[^>]*\bcode="([^"]+)"/g)].map(m => m[1]),
        ...[...text.matchAll(/:source-ref\{[^}]*code="([^"]+)"/g)].map(m => m[1]),
      ]
      const quoteCodes = [
        ...[...text.matchAll(/<[Qq]uote[Rr]eference\b[^>]*\bcode="([^"]+)"/g)].map(m => m[1]),
        ...[...text.matchAll(/:quote-reference\{[^}]*code="([^"]+)"/g)].map(m => m[1]),
      ]
      if (referenceCodes.length) content.referenceCodes = [...new Set(referenceCodes)]
      if (quoteCodes.length) content.quoteCodes = [...new Set(quoteCodes)]

      // :quelle-ref{name="..."} und <QuelleRef name="..."/> Tags aus dem Rohtext in coSources mergen
      const sourceTags = [
        ...[...text.matchAll(/:quelle-ref\{[^}]*name="([^"]+)"/g)].map(m => m[1]),
        ...[...text.matchAll(/<[Qq]uelle[Rr]ef\b[^>]*\bname="([^"]+)"/g)].map(m => m[1]),
      ]
      if (sourceTags.length) {
        const existing = Array.isArray(content.coSources) ? content.coSources as string[] : []
        content.coSources = [...new Set([...existing, ...sourceTags])]
      }
    },
  },
  eslint: {
    config: {
      stylistic: {
        braceStyle: '1tbs',
      },
    },
  },
  feedme: {
    defaults: {
      routes: false,
      common: false,
    },
    feeds: {
      common: {
        charset: 'utf8',
        revisit: '6h',
        fixDateFields: true,
        feed: {
          id: 'https://faktenfackel.de',
          title: 'Faktenfackel - Faktenchecks, Lagerfeuer & Glossar',
          link: 'https://faktenfackel.de',
          author: { email: 'kontakt@faktenfackel.de', name: 'Faktenfackel' },
          category: 'blog',
          copyright: 'CC BY-NC-SA 4.0 2026 by Faktenfackel',
        },
        collections: ['faktenchecks', 'lagerfeuer', 'glossar'],
      },
      routes: {
        '/feed.xml': {
          type: 'rss2',
          feed: { title: 'Faktenfackel - Faktenchecks, Lagerfeuer & Glossar' },
          collections: ['faktenchecks', 'lagerfeuer', 'glossar'],
        },
        '/feed.json': {
          type: 'json1',
          feed: { title: 'Faktenfackel - Faktenchecks, Lagerfeuer & Glossar' },
          collections: ['faktenchecks', 'lagerfeuer', 'glossar'],
        },

      },
    },
  },
  fonts: {
    families: [
      { name: 'Playfair Display', weights: [700, 900], display: 'swap', global: true },
      { name: 'Source Serif 4', weights: [300, 400, 600], styles: ['normal', 'italic'], display: 'swap' },
      { name: 'Ubuntu Mono', weights: [400, 700], display: 'swap', global: true },
    ],
  },
  ogImage: {
    zeroRuntime: true,
    defaults: {
      width: 1200,
      height: 630,
    },
  },
  sitemap: {
    sitemapName: 'sitemap.xml',
    defaultSitemapsChunkSize: 1000,
    exclude: [
      '/tags',
      '/tags/**',
    ],
    sources: [
      '/api/__sitemap__/urls',
    ],
  },
})
