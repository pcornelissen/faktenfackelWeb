/**
 * Setzt JSON-LD ClaimReview strukturierte Daten für Faktenchecks.
 * Google nutzt dieses Schema um Faktencheck-Ergebnisse direkt in den
 * Suchergebnissen anzuzeigen.
 *
 * Spec: https://schema.org/ClaimReview
 * Google Doku: https://developers.google.com/search/docs/appearance/structured-data/factcheck
 */

type VerdictType = 'false' | 'misleading' | 'complex' | 'true'

const verdictMap: Record<VerdictType, { ratingValue: number, bestRating: number, worstRating: number, alternateName: string }> = {
  false: { ratingValue: 1, bestRating: 5, worstRating: 1, alternateName: 'Falsch' },
  misleading: { ratingValue: 2, bestRating: 5, worstRating: 1, alternateName: 'Irreführend' },
  complex: { ratingValue: 3, bestRating: 5, worstRating: 1, alternateName: 'Komplex' },
  true: { ratingValue: 5, bestRating: 5, worstRating: 1, alternateName: 'Wahr' },
}

interface ClaimReviewOptions {
  title: string
  subtitle?: string
  url: string
  datePublished?: string
  dateModified?: string
  verdict?: VerdictType | null
  author?: string
}

export function useClaimReview(opts: ClaimReviewOptions) {
  if (!opts.verdict) return

  const rating = verdictMap[opts.verdict]
  const siteUrl = 'https://faktenfackel.de'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ClaimReview',
    'url': `${siteUrl}${opts.url}`,
    'datePublished': opts.datePublished || opts.dateModified || new Date().toISOString().split('T')[0],
    'claimReviewed': opts.subtitle || opts.title,
    'author': {
      '@type': 'Organization',
      'name': 'Faktenfackel',
      'url': siteUrl,
    },
    'itemReviewed': {
      '@type': 'Claim',
      'name': opts.title,
      'author': opts.author
        ? { '@type': 'Person', 'name': opts.author }
        : { '@type': 'Organization', 'name': 'Unbekannt' },
    },
    'reviewRating': {
      '@type': 'Rating',
      'ratingValue': rating.ratingValue,
      'bestRating': rating.bestRating,
      'worstRating': rating.worstRating,
      'alternateName': rating.alternateName,
    },
  }

  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(jsonLd),
        key: 'claim-review',
      },
    ],
  })
}
