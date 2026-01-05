// https://nuxt.com/docs/api/configuration/nuxt-config

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
  },
  colorMode: {
    preference: 'light',
  },
  routeRules: {
    '/': { prerender: true },
  },
  compatibilityDate: '2025-07-15',
  nitro: {
    preset: 'cloudflare_module',
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
          database_name: 'faktenfackel',
          database_id: 'a6056a8c-88ea-4396-bbd7-5b44fe4347a2',
        }],
        name: 'faktenfackel',
      },
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
    },
    feeds: {
      common: {
        charset: 'utf8',
        feed: {
          id: 'https://faktenfackel.de',
          title: 'Faktenfackel - Faktenchecks zu aktuellen Themen',
          link: 'https://faktenfackel.de',
          author: { email: 'kontakt@faktenfackel.de', name: 'Faktenfackel' },
          category: 'blog',
          copyright: 'CC BY-NC-SA 4.0 2026 by Faktenfackel',
        },
        collections: ['faktenchecks'],
      },
      routes: {
        '/feed.xml': {
          type: 'rss2',
          feed: { title: 'Faktenfackel - Faktenchecks zu aktuellen Themen' },
          collections: ['faktenchecks'],
        },
        '/feed.json': {
          type: 'json1',
          feed: { title: 'Faktenfackel - Faktenchecks zu aktuellen Themen' },
          collections: ['faktenchecks'],
        },

      },
    },
  },
  fonts: {
    // Options
  },
  sitemap: {
    zeroRuntime: true,
  },
})
