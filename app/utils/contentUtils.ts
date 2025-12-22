import { useRoute } from 'nuxt/app'
import { nextTick } from 'vue'

interface PageData {
  title: string
  pageHeading?: string
  pageSubHeading?: string
  description?: string
}

export function filter(list: Post[], category: string) {
  return list
    .filter(item => !item.path.endsWith(`/_info`))
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
  subject: string
  subtitle: string
  path: string
  tags: string[]
  lastChange: string
  published: boolean
}
