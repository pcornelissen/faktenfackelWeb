<script setup lang="ts">
import { capitalize } from '~/utils/stringUtils'
import PostsList from '~/components/content/PostsList.vue'

const route = useRoute()

const tag = route.params.tag as string

const { data: tagInfo }
  = await
  useAsyncData(
    `zitate-${tag}-info`,
    () => {
      return queryCollection('zitate').path(`/zitate/tags/${tag}/_info`).first()
    })

const title = `Zitate zum Schlagwort "${capitalize(tag)}"`

useSeoMeta({
  title: title,
  description: '',
  articleModifiedTime: new Date().toLocaleDateString(),
})

const { data: list1 } = await useAsyncData(route.path, () => {
  return queryCollection('zitate')
    .all()
})
const list = list1.value as Quote[]

function filter(list: Quote[]) {
  return list
    .filter(item => !!item.publishedOn && new Date(item.publishedOn) <= new Date())
    .filter(item => item.tags.map((t: string) => t.toLowerCase()).includes(tag.toLowerCase()))
}
</script>

<template>
  <div v-if="list">
    <NuxtLink
      :to="`/zitate`"
      style="display: inline-flex;
    vertical-align: middle;"
    >
      <icon
        name="i-lucide:arrow-left"
        style="margin-right: 0.5rem;"
      />
      Zurück zur Liste der Schlagworte
    </NuxtLink>

    <h1 style="margin-top: 1rem">
      {{ title }}
    </h1>

    <ContentRenderer
      v-if="tagInfo"
      :value="tagInfo"
      class="intro"
    />
    <QuotesList
      :list="list"
      :show-source="true"
    />
  </div>
  <div v-else>
    Schlagwort existiert nicht!<br>
    <br>
    <NuxtLink :to="`/zitate`">
      Zurück zu den Schlagworten
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
