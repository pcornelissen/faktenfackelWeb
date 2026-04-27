/**
 * Setzt JSON-LD BlogPosting strukturierte Daten für Lagerfeuer-Artikel.
 * Hilft Suchmaschinen und KI-Systemen, Blog-Inhalte besser zu verstehen.
 *
 * Spec: https://schema.org/BlogPosting
 */

import { resolveAuthors } from '~/utils/authors'

interface BlogPostingOptions {
  title: string
  description?: string
  url: string
  datePublished?: string
  dateModified?: string
  tags?: string[]
  authors?: readonly string[]
}

export function useBlogPosting(opts: BlogPostingOptions) {
  const { url: siteUrl } = useSiteConfig()
  const resolved = resolveAuthors(opts.authors)
  const authorJson = resolved.map(a => ({
    '@type': 'Person' as const,
    'name': a.name,
    'url': `${siteUrl}${a.url}`,
    ...(a.jobTitle ? { jobTitle: a.jobTitle } : {}),
    ...(a.sameAs?.length ? { sameAs: a.sameAs } : {}),
  }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': opts.title,
    'description': opts.description,
    'url': `${siteUrl}${opts.url}`,
    'datePublished': opts.datePublished || opts.dateModified || new Date().toISOString().split('T')[0],
    'dateModified': opts.dateModified || opts.datePublished || new Date().toISOString().split('T')[0],
    'author': authorJson.length === 1 ? authorJson[0] : authorJson,
    'image': `${siteUrl}/img/logo.webp`,
    'publisher': {
      '@type': 'Organization',
      'name': 'Faktenfackel',
      'url': siteUrl,
      'logo': {
        '@type': 'ImageObject',
        'url': `${siteUrl}/img/logo.webp`,
      },
    },
    'inLanguage': 'de-DE',
    ...(opts.tags?.length ? { keywords: opts.tags.join(', ') } : {}),
  }

  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(jsonLd),
        key: 'blog-posting',
      },
    ],
  })
}
