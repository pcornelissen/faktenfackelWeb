export interface RenameRoutes {
  [key: string]: string
}

const renames: RenameRoutes = {
  '/quellen/allgemein/bluesky-divers': '/quellen/allgemein/bluesky',
  '/quellen/allgemein/facebook-divers': '/quellen/allgemein/facebook',
  '/quellen/allgemein/tiktok-divers': '/quellen/allgemein/tiktok',
  '/quellen/allgemein/x-divers': '/quellen/allgemein/x',
  '/faktenchecks/gesellschaft/stadtbild': '/lagerfeuer/blog/merz-stadtbild',
  '/faktenchecks/gesellschaft/arbeitsmarkt/krise-im-rentensystem': '/lagerfeuer/blog/krise-im-rentensystem',
}

export function handleRenameRedirects(route: string) {
  for (const queryPath in renames) {
    if (route.startsWith(queryPath)) {
      const newUri = renames[queryPath] + route.substring(queryPath.length)
      navigateTo(newUri)
      return
    }
  }
}
