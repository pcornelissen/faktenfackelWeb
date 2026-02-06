export function extractCategoryFromPath(path: string) {
  return path.split('/').at(2)
}
export function extractNameFromPath(path: string) {
  return path.split('/').pop()
}

export function calculateSourceImg(source: Source) {
  const imageName = source.image || (extractNameFromPath(source.path) + '.webp')
  return (imageName?.startsWith('/')
    || imageName?.startsWith('http://')
    || imageName?.startsWith('https://'))
    ? imageName
    : '/files/quellen-img/' + extractCategoryFromPath(source.path) + '/' + imageName
}

export function calculateSourceImgAuthor(source: Source | null) {
  return `Bildquelle: ©${source?.imageAuthor || source?.name || 'unbekannt'}`
}
