export function extractCategoryFromPath(path: string) {
  return path.split('/').at(2)
}
export function extractNameFromPath(path: string) {
  return path.split('/').pop()
}

export function calculateSourceImg(source: Source) {
  return '/quellen-img/' + extractCategoryFromPath(source.path) + '/' + extractNameFromPath(source.path) + '/profile.webp'
}

export function calculateSourceImgAuthor(source: Source | null) {
  return `Bildquelle: ©${source?.imageAuthor || source?.name || 'unbekannt'}`
}
