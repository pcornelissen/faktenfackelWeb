<script setup lang="ts">
const { data: navigation } = await useAsyncData('navigation', () => {
  return Promise.all([
    queryCollectionNavigation('faktenchecks'),
    queryCollectionNavigation('glossar'),
    queryCollectionNavigation('quellen'),
    queryCollectionNavigation('quellenlinks'),
    queryCollectionNavigation('lagerfeuer'),
    queryCollectionNavigation('zitate'),
  ])
}, {
  transform: data => data.flat(),
})

const { data: files } = useLazyAsyncData('search', () => {
  return Promise.all([
    queryCollectionSearchSections('faktenchecks'),
    queryCollectionSearchSections('glossar'),
    queryCollectionSearchSections('quellen'),
    queryCollectionSearchSections('quellenlinks'),
    queryCollectionSearchSections('lagerfeuer'),
    queryCollectionSearchSections('zitate'),
  ])
}, {
  server: false,
  transform: data => data.flat(),
})

const { data: frontMatterMap } = useLazyAsyncData('search-frontmatter', async () => {
  const results = await Promise.all([
    queryCollection('faktenchecks').select('path', 'subtitle', 'tags').all(),
    queryCollection('glossar').select('path', 'subject', 'tags').all(),
    queryCollection('quellenlinks').select('path', 'tags').all(),
    queryCollection('lagerfeuer').select('path', 'subtitle', 'tags').all(),
    queryCollection('quellen').select('path', 'description', 'tags').all(),
    queryCollection('zitate').select('path', 'teaser', 'tags').all(),
  ])
  const map = new Map<string, string>()
  for (const item of results.flat()) {
    const extra = [
      (item as any).subtitle,
      (item as any).subject,
      (item as any).description,
      (item as any).teaser,
      (item as any).tags?.join(' '),
    ].filter(Boolean).join(' ')
    if (extra) map.set(item.path, extra)
  }
  return map
}, { server: false })

const enrichedFiles = computed(() => {
  const fm = frontMatterMap.value
  return (files.value ?? []).map((section) => {
    if (!fm || section.titles.length > 0) return section
    const docPath = section.id.split('#')[0]
    const extra = fm.get(docPath)
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
