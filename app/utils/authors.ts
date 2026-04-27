export interface Author {
  slug: string
  name: string
  url: string
  role?: string
  jobTitle?: string
  sameAs?: string[]
}

export const authors: Record<string, Author> = {
  'patrick-cornelissen': {
    slug: 'patrick-cornelissen',
    name: 'Patrick Cornelißen',
    url: '/autoren/patrick-cornelissen',
    role: 'Gründer & Autor',
    jobTitle: 'Gründer von Faktenfackel',
    sameAs: [
      'https://discord.faktenfackel.de',
      'https://www.youtube.com/@Faktenfackel',
    ],
  },
  'faktenfackel-redaktion': {
    slug: 'faktenfackel-redaktion',
    name: 'Faktenfackel Redaktion',
    url: '/autoren/redaktion',
    role: 'Redaktion',
    jobTitle: 'Redaktion',
  },
}

export const DEFAULT_AUTHOR_SLUG = 'faktenfackel-redaktion'

export function resolveAuthors(slugs: readonly string[] | undefined): Author[] {
  if (!slugs || slugs.length === 0) {
    return [authors[DEFAULT_AUTHOR_SLUG]!]
  }
  return slugs
    .map(slug => authors[slug])
    .filter((a): a is Author => Boolean(a))
}
