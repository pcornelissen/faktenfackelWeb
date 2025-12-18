// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/fonts',
    'nuxt-cloudflare-analytics',
    '@nuxt/scripts',
    '@nuxtjs/sitemap',
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
        d1_databases: [
          {
            binding: 'DB',
            database_name: 'ffdb',
            database_id: '15d7ea23-b605-4217-b4e6-2b0a8cf13f30',
          },
        ],
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
  cloudflareAnalytics: {
    token: 'a7464bd8e7454353b7fa774eac5dee57',
  },

  eslint: {
    config: {
      stylistic: {
        braceStyle: '1tbs',
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
