<script setup lang="ts">
import { capitalize } from '~/utils/stringUtils'
import PostsList from '~/components/content/PostsList.vue'
import type { Post } from '~/utils/contentUtils'
import { definePageData, filter } from '~/utils/contentUtils'

interface CategoryDoc {
  title?: string
  description?: string
  date?: string
  [key: string]: unknown
}

const route = useRoute()

const LAGERFEUER_CATEGORY_PAGE_SIZE = 100

const category = route.params.category as string
const basePath = route.path

const { data: categoryInfo } = await useFetch<CategoryDoc | null>('/api/content/doc', {
  key: `lagerfeuer-${category}-info`,
  query: { collection: 'lagerfeuer', path: `${basePath}/_info` },
})
const { data: post } = await useFetch<CategoryDoc | null>('/api/content/doc', {
  key: `lagerfeuer-${category}`,
  query: { collection: 'lagerfeuer', path: basePath },
})

const { data: list1 } = await useFetch<Post[]>('/api/content/list', {
  key: route.path,
  query: {
    collection: 'lagerfeuer',
    scope: 'prefix',
    value: basePath,
    fields: 'title,subtitle,path,publishedOn,tags,date,description',
  },
})
const list = computed(() => list1.value || [])
const categoryPosts = computed(() => filter(list.value, category, 'lagerfeuer'))
const isIndexableCategory = computed(() => Boolean(categoryInfo.value) && categoryPosts.value.length >= 4)
const title = categoryInfo.value?.title || `Lagerfeuer Beiträge im Bereich ${capitalize(category)}`

await definePageData({
  title: title,
  pageHeading: `Lagerfeuer - ${capitalize(category)}`,
  pageSubHeading: 'Beiträge',
  description: post.value?.description,
  lastmod: new Date(post.value?.date || new Date()),
  sitemap: isIndexableCategory.value
    ? {
        priority: 0.8,
        changefreq: 'daily',
      }
    : false,
})

useSeoMeta({
  robots: isIndexableCategory.value ? 'index, follow' : 'noindex, follow',
})
</script>

<template>
  <div v-if="list.length">
    <h1 style="margin-top: 0">
      {{ title }}
    </h1>
    <ContentRenderer
      v-if="categoryInfo"
      :value="categoryInfo"
      class="intro content"
    />
    <PostsList
      :list="categoryPosts"
      :page-size="LAGERFEUER_CATEGORY_PAGE_SIZE"
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
