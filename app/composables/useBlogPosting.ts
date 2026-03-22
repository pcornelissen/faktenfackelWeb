/**
 * Setzt JSON-LD BlogPosting strukturierte Daten für Lagerfeuer-Artikel.
 * Hilft Suchmaschinen und KI-Systemen, Blog-Inhalte besser zu verstehen.
 *
 * Spec: https://schema.org/BlogPosting
 */

interface BlogPostingOptions {
  title: string
  description?: string
  url: string
  datePublished?: string
  dateModified?: string
  tags?: string[]
}

export function useBlogPosting(opts: BlogPostingOptions) {
  const siteUrl = 'https://faktenfackel.de'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': opts.title,
    'description': opts.description,
    'url': `${siteUrl}${opts.url}`,
    'datePublished': opts.datePublished || opts.dateModified || new Date().toISOString().split('T')[0],
    'dateModified': opts.dateModified || opts.datePublished || new Date().toISOString().split('T')[0],
    'author': {
      '@type': 'Organization',
      'name': 'Faktenfackel',
      'url': siteUrl,
    },
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
