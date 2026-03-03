<script setup lang="ts">
import PostsList from '~/components/content/PostsList.vue'
import Heading from '~/components/layout/Heading.vue'
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
    .select('title', 'subject', 'path', 'publishedOn', 'tags', 'date')
    .all()
})
const list = list1.value as Post[]

function filter(list: Post[]) {
  return list
    .filter(item => !!item.publishedOn && new Date(item.publishedOn) <= new Date())
}
</script>

<template>
  <div v-if="list">
    <Heading
      title="Glossar"
      icon="blogging"
      icon-txt="Blogging Icons erstellt von Freepik - Flaticon"
    />
    <p class="intro">
      Im Glossar erklären wir Begriffe aus den Bereichen Desinformation, Medien und Faktenchecks –
      kompakt und verständlich aufbereitet. Von rhetorischen Tricks bis zu medialen Phänomenen.
    </p>
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
.intro {
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.7;
  max-width: 60ch;
  margin-bottom: 2rem;
}
</style>
