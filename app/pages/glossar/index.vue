<script setup lang="ts">
import PostsList from '~/components/content/PostsList.vue'
import { definePageData, type Post } from '~/utils/contentUtils'

const route = useRoute()

await definePageData({
  title: 'Glossar',
  pageHeading: 'Faktenfackel - Glossar',
  pageSubHeading: 'Das kleine Lexikon für zwischendurch',
  description: '',
})

const { data: list1 } = await useAsyncData(route.path, () => {
  return queryCollection('glossar')
    .select('title', 'subject', 'path', 'published', 'tags', 'date')
    .all()
})
const list = list1.value as Post[]

function filter(list: Post[]) {
  return list
    .filter(item => !!item.published && new Date(item.published) <= new Date())
}
</script>

<template>
  <div v-if="list">
    <h1 style="margin-top: 0">
      Glossar
    </h1>
    <PostsList
      :list="filter(list)"
      :base-path="route.path"
      icon="mdi:book-education-outline"
    />
  </div>
  <div v-else>
    Diese Seite existiert nicht!<br>
    <br>
    <NuxtLink to="/">
      Zurück zur Startseite
    </NuxtLink>
  </div>
</template>

<style scoped>
</style>
