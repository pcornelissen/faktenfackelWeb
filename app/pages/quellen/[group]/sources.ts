import profileImagePaths from '~/data/sourceProfileImages.json'

const profileImageSet = new Set<string>(profileImagePaths as string[])

export function extractCategoryFromPath(path: string) {
  return path.split('/').at(2)
}
export function extractNameFromPath(path: string) {
  return path.split('/').pop()
}

export function calculateSourceImg(source: Source) {
  const category = extractCategoryFromPath(source.path)
  const name = extractNameFromPath(source.path)
  if (!category || !name || !profileImageSet.has(`${category}/${name}`)) {
    return '/default-profile.webp'
  }
  return `/quellen-img/${category}/${name}/profile.webp`
}

export function calculateSourceImgAuthor(source: Source | null) {
  return `Bildquelle: ©${source?.imageAuthor || source?.name || 'unbekannt'}`
}
