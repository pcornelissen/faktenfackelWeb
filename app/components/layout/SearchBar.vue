<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

type ContentSearchFile = {
  id: string
  title: string
  titles: string[]
  level: number
  content: string
}

type SearchPayload = {
  navigation: ContentNavigationItem[]
  files: ContentSearchFile[]
  frontMatter: Record<string, string>
}

const {
  data: searchData,
  execute: executeSearch,
  status: searchStatus,
} = await useAsyncData<SearchPayload>(
  'search-payload',
  () => $fetch('/api/search'),
  {
    server: false,
    immediate: false,
    default: () => ({ navigation: [], files: [], frontMatter: {} }),
  },
)

const navigation = computed(() => searchData.value?.navigation ?? [])
const files = computed(() => searchData.value?.files ?? [])
const frontMatterMap = computed(() => searchData.value?.frontMatter ?? {})

const enrichedFiles = computed<ContentSearchFile[]>(() => {
  const fm = frontMatterMap.value
  return files.value.map((section) => {
    if (section.titles.length > 0) return section
    const docPath = section.id.split('#')[0] ?? section.id
    const extra = fm[docPath]
    if (!extra) return section
    return { ...section, content: extra + (section.content ? ' ' + section.content : '') }
  })
})

const searchTerm = ref('')

function loadSearchData() {
  if (searchStatus.value === 'idle') {
    executeSearch()
  }
}
</script>

<template>
  <div
    @pointerdown.capture="loadSearchData"
    @focusin="loadSearchData"
  >
    <UContentSearchButton
      :collapsed="false"
      label="&nbsp;&nbsp;Suchen&nbsp;&nbsp;&nbsp;"
      :kbds="[]"
    />
  </div>

  <LazyUContentSearch
    v-model:search-term="searchTerm"
    :files="enrichedFiles"
    :color-mode="false"
    placeholder="Suche nach Inhalten"
    :navigation="navigation"
    :fuse="{ resultLimit: 42 }"
    title="Suche"
  />
</template>

<style scoped>

</style>
