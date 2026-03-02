<script setup lang="ts">
import { useAsyncData, useRoute } from 'nuxt/app'
import { definePageData } from '~/utils/contentUtils'
import { referencesStore, extractCodes } from '~/utils/referenceData'

const route = useRoute()
const category = route.params.category as string
const slug = (route.params.slug as string[]).join('/')
const categoryPath = `/lagerfeuer/${category}`
const basePath = route.path

const { data: surround } = await useAsyncData(`${route.path}-surround`, () => {
  return queryCollectionItemSurroundings('lagerfeuer', basePath, {
    fields: ['subtitle'],
  }).where('path', 'NOT LIKE', '%_info')
})

const { data: page } = await useAsyncData(
  `lagerfeuer-${slug}`,
  () => queryCollection('lagerfeuer').path(basePath).first(),
)

const title = page.value?.title || `Lagerfeuer`
const subtitle = page.value?.subtitle || ``

await definePageData({
  title: title + ' - Faktenfackel',
  pageHeading: title,
  pageSubHeading: subtitle as string,
  description: page.value?.description,
  lastmod: new Date(page.value?.date || new Date()),
})

useSeoMeta({
  title: title + ' - Faktenfackel',
  description: page.value?.description || subtitle,
  articleModifiedTime: page.value?.date || new Date().toLocaleDateString(),
})

const lastChangeStr = page.value?.date as string | null || ''
const lastChange = dateString(lastChangeStr)

await referencesStore.fetchFor(extractCodes(page.value?.body))
</script>

<template>
  <div>
    <BackLink :to="categoryPath">
      Zurück zum Bereich {{ capitalize(category) }}
    </BackLink>

    <div v-if="page">
      <div class="article-header">
        <div class="article-headline">
          Stand: {{ lastChange }}
        </div>
        <h1 class="article-title">
          {{ page.title }}
        </h1>
        <p
          v-if="page.subtitle"
          class="article-subtitle"
        >
          {{ page.subtitle }}
        </p>
      </div>

      <UAlert
        v-if="!page.publishedOn || new Date(page.publishedOn) > new Date()"
        type="info"
        icon="i-lucide-badge-info"
        title="Achtung! Dieser Artikel ist aktuell in Bearbeitung und kann fehlende, falsche und unbelegte Informationen enthalten"
      />

      <div class="article-body content">
        <ContentRenderer
          v-if="page.body"
          :value="page"
        />
        <USeparator
          v-if="surround?.filter(Boolean).length"
          class="my-8"
        />
        <UContentSurround :surround="(surround as any)">
          <template #link-description="{ link }">
            {{ link?.subtitle || link?.description }}
          </template>
        </UContentSurround>
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
