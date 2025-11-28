export function filter(list: any[], category: string) {
  return list
    .filter(item => item.meta.published)
    .filter(item => item.path.startsWith(`/faktenchecks/${category}/`))
}
