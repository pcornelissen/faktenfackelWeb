<script setup lang="ts">
const { data: searchData } = useLazyAsyncData(
  'search-payload',
  () => $fetch('/api/search'),
  { server: false },
)

const navigation = computed(() => searchData.value?.navigation ?? [])
const files = computed(() => searchData.value?.files ?? [])
const frontMatterMap = computed(() => searchData.value?.frontMatter ?? {})

const enrichedFiles = computed(() => {
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
</script>

<template>
  <UContentSearchButton
    :collapsed="false"
    label="&nbsp;&nbsp;Suchen&nbsp;&nbsp;&nbsp;"
    :kbds="[]"
  />

  <UContentSearch
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
