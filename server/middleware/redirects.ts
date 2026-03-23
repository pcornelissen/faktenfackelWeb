const redirects: Record<string, string> = {
  '/quellen/allgemein/bluesky-divers': '/quellen/allgemein/bluesky',
  '/quellen/allgemein/facebook-divers': '/quellen/allgemein/facebook',
  '/quellen/allgemein/tiktok-divers': '/quellen/allgemein/tiktok',
  '/quellen/allgemein/x-divers': '/quellen/allgemein/x',
  '/faktenchecks/gesellschaft/stadtbild': '/lagerfeuer/perspektiven/2025-12-12.merz-stadtbild',
  '/faktenchecks/gesellschaft/arbeitsmarkt/krise-im-rentensystem': '/lagerfeuer/perspektiven/2026-01-05.krise-im-rentensystem',
  // Google 404s: alte URL-Struktur ohne group-Segment
  '/quellen/europarl/links/migrationsgrunde': '/quellen/staatlich/europarl',
  '/quellen/mediendienst-integration/links/mehr-fluchtlinge-in-arbeit-als-nicht': '/quellen/medien/mediendienst-integration',
  '/quellen/personalwirtschaft/links/anerkennung-ausl-abschlusse': '/quellen/portale/personalwirtschaft',
  '/quellen/gesetze-im-internet/links/asylg-paragraph-61': '/quellen/staatlich/gesetze-im-internet',
  // Google 404s: sonstige
  '/faktenchecks/_vorlage': '/faktenchecks',
  '/faktenchecks/politik/parteien': '/faktenchecks',
  '/quellen/medien/ndr/links': '/quellen/medien/ndr',
  '/quellen/nachrichten/tagesschau/links/quellen/tags/SPD': '/tags/spd',
}

export default defineEventHandler((event) => {
  const url = event.path
  for (const [from, to] of Object.entries(redirects)) {
    if (url === from || url.startsWith(from + '/')) {
      return sendRedirect(event, to + url.slice(from.length), 301)
    }
  }
})
