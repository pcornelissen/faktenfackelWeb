interface ContentItem {
  meta: {
    published: boolean
  }
  path: string
}

interface PageData {
  title: string
  pageHeading?: string
  pageSubHeading?: string
  description?: string
}

export function filter(list: ContentItem[], category: string) {
  return list
    .filter(item => item.meta.published)
    .filter(item => item.path.startsWith(`/faktenchecks/${category}/`))
}

export function definePageData(data: PageData) {
  definePageMeta({ title: '', pageHeading: '', pageSubHeading: '', description: '' })
  if (data.title)
    useRoute().meta.title = data.title
  if (data.pageHeading)
    useRoute().meta.pageHeading = data.pageHeading
  if (data.pageSubHeading)
    useRoute().meta.pageSubHeading = data.pageSubHeading
  if (data.description)
    useRoute().meta.description = data.description
}
