import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import { asSitemapCollection } from '@nuxtjs/sitemap/content'

export default defineContentConfig({
  collections: {
    faktenchecks: defineCollection({
      type: 'page',
      source: 'faktenchecks/**/*.md',
      // Define custom schema for this collection
      schema: z.object({
        date: z.date(),
        title: z.string(),
        subtitle: z.string(),
        publishedOn: z.date().or(z.null()),
        loadInstagram: z.boolean().or(z.null()),
        tags: z.set(z.string()),
      }),
    }),
    glossar: defineCollection({
      type: 'page',
      source: 'glossar/**/*.md',
      // Define custom schema for this collection
      schema: z.object({
        date: z.date(),
        title: z.string(),
        subject: z.string(),
        publishedOn: z.date().or(z.null()),
        tags: z.set(z.string()),
      }),
    }),
    quellen: defineCollection({
      type: 'page',
      source: 'quellen/*/*.md',
      schema: z.object({
        date: z.date(),
        name: z.string(),
        description: z.string(),
        image: z.string().or(z.null()),
        tags: z.set(z.string()),
      }),
    }),
    quellenlinks: defineCollection({
      type: 'page',
      source: 'quellen/*/links/**/*.md',
      schema: z.object({
        date: z.date(),
        code: z.string(),
        title: z.string(),
        uri: z.string(),
        type: z.string(),
        tags: z.set(z.string()),
        coSources: z.set(z.string()),
      }),
      indexes: [
        { columns: ['code'], unique: true },
      ],
    }),
    sitemap: defineCollection(
      asSitemapCollection({
        type: 'page',
        source: '**/*.md',
      }),
    ),
  },
})
