<script setup lang="ts">
const { data: navigation } = await useAsyncData('navigation', () => {
  return Promise.all([
    queryCollectionNavigation('faktenchecks'),
    queryCollectionNavigation('glossar'),
    queryCollectionNavigation('quellen'),
    queryCollectionNavigation('quellenlinks'),
    queryCollectionNavigation('lagerfeuer'),
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
  ])
}, {
  server: false,
  transform: data => data.flat(),
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
    :files="files"
    :color-mode="false"
    placeholder="Suche nach Inhalten"
    :navigation="navigation"
    :fuse="{ resultLimit: 42 }"
    title="Suche"
  />
</template>

<style scoped>

</style>
