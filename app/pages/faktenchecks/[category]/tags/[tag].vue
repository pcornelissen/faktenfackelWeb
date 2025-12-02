<script setup lang="ts">
import { capitalize } from '~/utils/stringUtils'
import PostsList from '~/components/content/PostsList.vue'

const route = useRoute()

const category = route.params.category as string
const tag = route.params.tag as string

const { data: tagInfo }
  = await
  useAsyncData(
    `faktencheck-${category}`,
    () => {
      return queryCollection('faktenchecks').path(`/faktenchecks/tags/${tag}/_info`).first()
    })

const { data: post }
  = await
  useAsyncData(
    `faktencheck-${category}`,
    () => {
      return queryCollection('faktenchecks').path(`/faktenchecks      /${category}`).first()
    })

const title = `Faktenchecks im Bereich ${capitalize(category)} zum Schlagwort "${capitalize(tag)}"`

useSeoMeta({
  title: post.value?.title || title,
  description: post.value?.description,
})

const { data: list1 } = await useAsyncData(route.path, () => {
  return queryCollection('faktenchecks')
    .select('title', 'path', 'meta')
    .all()
})
const list = list1.value as Post[]

function filter(list: Post[]) {
  return list
    .filter(item => item.meta.published)
    .filter(item => item.meta.tags.map((t: string) => t.toLowerCase()).includes(tag.toLowerCase()))
    .filter(item => item.path.startsWith(`/faktenchecks /${category}/`))
}
</script>

<template>
  <div v-if="list">
    <NuxtLink :to="`/faktenchecks/${category}`">
      Zurück zum Bereich {{ capitalize(category) }}
    </NuxtLink>
    <h1>{{ title }}</h1>
    <ContentRenderer
      v-if="tagInfo"
      :value="tagInfo"
      class="intro"
    />

    <PostsList
      :list="filter(list)"
      :base-path="`/faktenchecks/${category}`"
    />
  </div>
  <div v-else>
    Diese Seite existiert nicht!<br>
    <br>
    <NuxtLink :to="`/faktencheck/${category}`">
      Zurück zum Bereich {{ capitalize(category) }}
    </NuxtLink>
  </div>
</template>

<style scoped>
.intro {
  margin-bottom: 2rem;
  padding: 0.5rem;
  border-radius: 0.3rem;
  background-color: #eee;
}
</style>
