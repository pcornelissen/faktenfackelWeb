import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    faktenchecks: defineCollection({
      type: 'page',
      source: 'faktenchecks/**/*.md',
      schema: z.object({
        date: z.date(),
        title: z.string(),
        subtitle: z.string(),
        publishedOn: z.date().or(z.null()),
        verdict: z.enum(['false', 'misleading', 'complex', 'true']).optional(),
        tags: z.set(z.string()),
        referenceCodes: z.array(z.string()).optional(),
        quoteCodes: z.array(z.string()).optional(),
      }),
    }),
    lagerfeuer: defineCollection({
      type: 'page',
      source: 'lagerfeuer/**/*.md',
      schema: z.object({
        date: z.date(),
        title: z.string(),
        subtitle: z.string(),
        description: z.string().optional(),
        publishedOn: z.date().or(z.null()),
        tags: z.set(z.string()),
        referenceCodes: z.array(z.string()).optional(),
        quoteCodes: z.array(z.string()).optional(),
      }),
    }),
    glossar: defineCollection({
      type: 'page',
      source: 'glossar/**/*.md',
      schema: z.object({
        date: z.date(),
        title: z.string(),
        subject: z.string(),
        publishedOn: z.date().or(z.null()),
        tags: z.set(z.string()),
      }),
    }),
    zitate: defineCollection({
      type: 'page',
      source: 'quellen/*/*/zitate/*.md',
      schema: z.object({
        date: z.date(),
        code: z.string(),
        title: z.string(),
        publishedOn: z.date().or(z.null()),
        tags: z.set(z.string()),
        teaser: z.string(),
        referenceCodes: z.array(z.string()).optional(),
        quoteCodes: z.array(z.string()).optional(),
      }),
      indexes: [
        { columns: ['code'], unique: true },
      ],
    }),
    quellen: defineCollection({
      type: 'page',
      source: 'quellen/*/*/*.md',
      schema: z.object({
        date: z.date(),
        name: z.string(),
        description: z.string(),
        image: z.string().or(z.null()),
        imageAuthor: z.string().or(z.null()),
        tags: z.set(z.string()),
        referenceCodes: z.array(z.string()).optional(),
        quoteCodes: z.array(z.string()).optional(),
      }),
    }),
    quellenlinks: defineCollection({
      type: 'page',
      source: 'quellen/*/*/links/**/*.md',
      schema: z.object({
        date: z.date(),
        code: z.string(),
        title: z.string(),
        uri: z.string(),
        type: z.string(),
        verdict: z.enum(['false', 'misleading', 'complex', 'true']).optional(),
        tags: z.set(z.string()),
        coSources: z.set(z.string()),
        referenceCodes: z.array(z.string()).optional(),
        quoteCodes: z.array(z.string()).optional(),
      }),
      indexes: [
        { columns: ['code'], unique: true },
      ],
    }),
  },
})
