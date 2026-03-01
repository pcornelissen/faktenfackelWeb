<script setup lang="ts">
import { capitalize } from '~/utils/stringUtils'
import PostsList from '~/components/content/PostsList.vue'
import { definePageData, filter } from '~/utils/contentUtils'

const route = useRoute()

const category = route.params.category as string
const basePath = route.path

const { data: categoryInfo }
  = await
  useAsyncData(
    `lagerfeuer-${category}-info`,
    () => {
      return queryCollection('lagerfeuer').path(`${basePath}/_info`).first()
    })
const { data: post }
  = await
  useAsyncData(
    `lagerfeuer-${category}`,
    () => {
      return queryCollection('lagerfeuer').path(`${basePath}`).first()
    })

const title = categoryInfo.value?.title || `Lagerfeuer Beiträge im Bereich ${capitalize(category)}`

await definePageData({
  title: title,
  pageHeading: `Lagerfeuer - ${capitalize(category)}`,
  pageSubHeading: 'Beiträge',
  description: post.value?.description,
  lastmod: new Date(post.value?.date || new Date()),
})

const { data: list1 } = await useAsyncData(route.path, () => {
  return queryCollection('lagerfeuer')
    .select('title', 'subtitle', 'path', 'publishedOn', 'tags', 'date', 'description')
    .all()
})
const list = list1.value as Post[]
</script>

<template>
  <div v-if="list">
    <h1 style="margin-top: 0">
      {{ title }}
    </h1>
    <ContentRenderer
      v-if="categoryInfo"
      :value="categoryInfo"
      class="intro"
    />
    <PostsList
      :list="filter(list, category, 'lagerfeuer')"
      :base-path="route.path"
    />
  </div>
  <div v-else>
    Diese Seite existiert nicht!<br>
    <br>
    <NuxtLink :to="`/lagerfeuer/`">
      Zurück zur Übersicht
    </NuxtLink>
  </div>
  <!--  <debug :content=route></debug> -->
</template>

<style scoped>
.intro {
  margin-bottom: 2rem;
  padding: 0.5rem;
  border-radius: 0.3rem;
  background-color: #eee;
}
</style>
