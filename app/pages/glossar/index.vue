<script setup lang="ts">
import PostsList from '~/components/content/PostsList.vue'
import Heading from '~/components/layout/Heading.vue'
import { definePageData, nowIso, type Post } from '~/utils/contentUtils'

const route = useRoute()

await definePageData({
  title: 'Glossar: Politik und Faktencheck | Faktenfackel',
  pageHeading: 'Faktenfackel - Glossar',
  pageSubHeading: 'Das kleine Lexikon für zwischendurch',
  description: 'Das Faktenfackel-Glossar erklärt wichtige Begriffe aus Politik, Medien und Faktencheck-Kontext kurz und verständlich.',
})

const { data: list1 } = await useAsyncData(route.path, () => {
  return queryCollection('glossar')
    .select('title', 'subject', 'description', 'path', 'publishedOn', 'tags', 'date')
    .where('publishedOn', '<=', nowIso())
    .all()
})
const list = list1.value as Post[]

const { url: siteUrl } = useSiteConfig()

useHead({
  script: [
    {
      type: 'application/ld+json',
      key: 'glossar-defined-term-set',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'DefinedTermSet',
        'name': 'Faktenfackel Glossar',
        'url': `${siteUrl}/glossar/`,
        'description': 'Das Faktenfackel-Glossar erklärt wichtige Begriffe aus Politik, Medien und Faktencheck-Kontext kurz und verständlich.',
        'hasDefinedTerm': list.map(item => ({
          '@type': 'DefinedTerm',
          'name': item.subject || item.title,
          'url': `${siteUrl}${item.path}`,
          ...(item.description ? { description: item.description } : {}),
        })),
      }),
    },
  ],
})
</script>

<template>
  <div v-if="list">
    <Heading
      as="h1"
      title="Glossar"
      icon="blogging"
      icon-txt="Blogging Icons erstellt von Freepik - Flaticon"
    />
    <p class="intro">
      Im Glossar erklären wir Begriffe aus den Bereichen Desinformation, Medien und Faktenchecks
      kompakt und verständlich. Von rhetorischen Tricks bis zu medialen Phänomenen.
    </p>
    <PostsList
      :list="list"
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
