import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    faktenchecks: defineCollection({
      type: 'page',
      source: 'faktenchecks/**/*.md',
      // Define custom schema for this collection
      schema: z.object({
        lastChange: z.date(),
        title: z.string(),
        subtitle: z.string(),
        published: z.boolean(),
        loadInstagramm: z.boolean().or(z.null()),
        tags: z.set(z.string()),
      }),
    }),
    glossar: defineCollection({
      type: 'page',
      source: 'glossar/**/*.md',
      // Define custom schema for this collection
      schema: z.object({
        lastChange: z.date(),
        title: z.string(),
        subject: z.string(),
        published: z.boolean(),
        tags: z.set(z.string()),
      }),
    }),
  },
})
