interface PageData {
  title: string
  pageHeading?: string
  pageSubHeading?: string
  description?: string
}

export function filter(list: Post[], category: string) {
  return list
    .filter(item => item.meta.published)
    .filter(item => item.path.startsWith(`/faktenchecks/${category}/`))
}

export async function definePageData(data: PageData) {
  definePageMeta({ title: '', pageHeading: '', pageSubHeading: '', description: '' })
  if (data.title)
    useRoute().meta.title = data.title
  if (data.pageHeading)
    useRoute().meta.pageHeading = data.pageHeading
  if (data.pageSubHeading)
    useRoute().meta.pageSubHeading = data.pageSubHeading
  if (data.description)
    useRoute().meta.description = data.description
  await nextTick()
}

export type Post = {
  title: string
  path: string
  meta: {
    'tags': string[]
    'last-change': string
    'published': boolean
  }
}
