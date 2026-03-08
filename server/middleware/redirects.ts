const redirects: Record<string, string> = {
  '/quellen/allgemein/bluesky-divers': '/quellen/allgemein/bluesky',
  '/quellen/allgemein/facebook-divers': '/quellen/allgemein/facebook',
  '/quellen/allgemein/tiktok-divers': '/quellen/allgemein/tiktok',
  '/quellen/allgemein/x-divers': '/quellen/allgemein/x',
  '/faktenchecks/gesellschaft/stadtbild': '/lagerfeuer/blog/merz-stadtbild',
  '/faktenchecks/gesellschaft/arbeitsmarkt/krise-im-rentensystem': '/lagerfeuer/blog/krise-im-rentensystem',
}

export default defineEventHandler((event) => {
  const url = event.path
  for (const [from, to] of Object.entries(redirects)) {
    if (url === from || url.startsWith(from + '/')) {
      return sendRedirect(event, to + url.slice(from.length), 301)
    }
  }
})
