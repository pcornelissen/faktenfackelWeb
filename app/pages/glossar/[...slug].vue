<script setup lang="ts">
import { definePageData } from '~/utils/contentUtils'

const route = useRoute()
const slug = (route.params.slug as string[]).join('/')
const basePath = route.path

const { data: surround } = await useAsyncData(`${route.path}-surround`, () => {
  return queryCollectionItemSurroundings('glossar', basePath, { fields: ['description'] })
})

const { data: page } = await useAsyncData(
  `glossar-${slug}`,
  () => queryCollection('glossar').path(basePath).first(),
)

const title = page.value?.title || `Glossar`

await definePageData({
  title: title + ' - Faktenfackel Glossar',
  pageHeading: title,
  pageSubHeading: '',
  description: page.value?.description,
  lastmod: new Date(page.value?.date || new Date()),
})

const lastChangeStr = page.value?.date as string | null || ''
const lastChange = dateString(lastChangeStr)
</script>

<template>
  <div>
    <BackLink to="/glossar">Zurück zum Glossar</BackLink>

    <div v-if="page">
      <div class="article-header">
        <div class="article-headline">
          Stand: {{ lastChange }}
        </div>
        <h1 class="article-title">
          {{ page.title }}
        </h1>
        <p
          v-if="page.description"
          class="article-subtitle"
        >
          {{ page.description }}
        </p>
      </div>

      <div class="article-body content">
        <ContentRenderer
          v-if="page.body"
          :value="page"
        />
        <USeparator
          v-if="surround?.filter(Boolean).length"
          class="my-8"
        />
        <UContentSurround :surround="(surround as any)" />
      </div>
    </div>

    <div v-else>
      Diese Seite existiert nicht!
    </div>
  </div>
</template>

<style scoped>
.article-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--fackel-border);
}

.article-headline {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--flame);
  margin-bottom: 0.5rem;
}

.article-title {
  margin: 0 0 0.4rem;
  line-height: 1.15;
}

.article-subtitle {
  font-size: 1.05rem;
  color: var(--muted);
  font-weight: 300;
  margin: 0;
  line-height: 1.5;
}

.article-body {
  margin-top: 1.5rem;
}
</style>
