<script setup lang="ts">
import { useAsyncData, useRoute } from 'nuxt/app'
import { definePageData } from '~/utils/contentUtils'
import { referencesStore, extractCodes } from '~/utils/referenceData'

const route = useRoute()

const category = route.params.category as string
const slug = (route.params.slug as string[]).join('/')

const categoryPath = `/faktenchecks/${category}`
const basePath = route.path

const { data: surround } = await useAsyncData(`${route.path}-surround`, () => {
  return queryCollectionItemSurroundings('faktenchecks', basePath, {
    fields: ['subtitle'],
  }).where('path', 'NOT LIKE', '%_info')
})

const { data: page } = await useAsyncData(
  `faktencheck-${slug}`,
  () => queryCollection('faktenchecks').path(basePath).first(),
)

const title = page.value?.title || `Faktencheck`
const subtitle = page.value?.subtitle || `Faktencheck`

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
  ogUrl: `https://faktenfackel.de${route.path}`,
  twitterCard: 'summary_large_image',
  articleModifiedTime: page.value?.date || new Date().toLocaleDateString(),
})

useClaimReview({
  title: page.value?.title || title,
  subtitle: page.value?.subtitle,
  url: route.path,
  dateModified: page.value?.date,
  datePublished: page.value?.publishedOn || undefined,
  verdict: page.value?.verdict,
})

const loadInstagram = page.value?.loadInstagram || false
if (loadInstagram) {
  useHead({
    script: [{ src: 'https://www.instagram.com/embed.js', async: true }],
  })
}

const lastChangeStr = page.value?.date as string | null || ''
const lastChange = dateString(lastChangeStr)

referencesStore.fetchFor(extractCodes(page.value?.body))
</script>

<template>
  <div>
    <NuxtLink
      :to="categoryPath"
      style="display: inline-flex; vertical-align: middle;"
    >
      <icon
        name="i-lucide:arrow-left"
        style="margin-right: 0.5rem;"
      />
      Zurück zum Bereich {{ capitalize(category) }}
    </NuxtLink>

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
        <VerdictLabel
          v-if="page.verdict !== undefined"
          :type="page.verdict"
          class="article-verdict"
        />
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

.article-verdict {
  display: inline-block;
  margin: 0.5rem 0 0.75rem;
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
