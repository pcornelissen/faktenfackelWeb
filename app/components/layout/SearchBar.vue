<script setup lang="ts">
  const {data: navigation} = await useAsyncData('navigation', () => queryCollectionNavigation('faktenchecks'))
  const {data: files} = await useAsyncData('search', () => queryCollectionSearchSections('faktenchecks'))

  const searchTerm = ref('')
</script>

<template>
  <UContentSearchButton/>

  <UContentSearch
    v-model:search-term="searchTerm"
    :files="files"
    :color-mode="false"
    placeholder="Suche nach Faktenchecks"
    :navigation="navigation"
    :fuse="{ resultLimit: 42 }"
  />
</template>

<style scoped>

</style>
