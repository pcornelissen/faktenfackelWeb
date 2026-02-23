<script setup lang="ts">
import { capitalize } from '~/utils/stringUtils'
import PostsList from '~/components/content/PostsList.vue'
import { definePageData, filter } from '~/utils/contentUtils'

const route = useRoute()

const category = route.params.category as string
const basePath = route.path// `/faktencheck/${category}`;

const { data: categoryInfo }
  = await
  useAsyncData(
    `faktencheck-${category}-info`,
    () => {
      return queryCollection('faktenchecks').path(`${basePath}/_info`).first()
    })

const title = categoryInfo.value?.title || `Faktenchecks im Bereich ${capitalize(category)}`

await definePageData({
  title: title,
  pageHeading: 'Faktenfackel - Faktenchecks',
  pageSubHeading: 'Themenbereiche',
  description: categoryInfo.value?.description,
})

const { data: list1 } = await useAsyncData(route.path, () => {
  return queryCollection('faktenchecks')
    .select('title', 'subtitle', 'path', 'publishedOn', 'tags', 'date')
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
      :list="filter(list, category)"
      :base-path="route.path"
    />
  </div>
  <div v-else>
    Diese Seite existiert nicht!<br>
    <br>
    <NuxtLink :to="`/faktenchecks/`">
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
