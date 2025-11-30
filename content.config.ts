import { defineContentConfig, defineCollection } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    faktenchecks: defineCollection({
      type: 'page',
      source: 'faktenchecks/**/*.md',

    }),
  },
})
