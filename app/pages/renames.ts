export interface RenameRoutes {
  [key: string]: string
}

const renames: RenameRoutes = {
  '/quellen/allgemein/bluesky-divers': '/quellen/allgemein/bluesky',
  '/quellen/allgemein/facebook-divers': '/quellen/allgemein/facebook',
  '/quellen/allgemein/tiktok-divers': '/quellen/allgemein/tiktok',
  '/quellen/allgemein/x-divers': '/quellen/allgemein/x',
}

export function handleRenameRedirects(route: string) {
  for (const queryPath in renames) {
    console.log('Checking', route, queryPath)
    if (route.startsWith(queryPath)) {
      const newUri = renames[queryPath] + route.substring(queryPath.length)
      console.log('Found redirect', route, newUri)
      navigateTo(newUri)
      return
    }
  }
}
