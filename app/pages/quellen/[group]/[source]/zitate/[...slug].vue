<script setup lang="ts">
import { useAsyncData, useRoute } from 'nuxt/app'
import { definePageData, getSourceFromPath } from '~/utils/contentUtils'
import Tags from '~/components/sources/Tags.vue'
import { referencesStore } from '~/utils/referenceData'

const route = useRoute()

const slug = (route.params.slug as string[]).join('/')
const basePath = route.path
const sourcePath = getSourceFromPath(route.path)

const { data: surround } = await useAsyncData(`${route.path}-surround`, () => {
  return queryCollectionItemSurroundings('zitate', basePath).where('path', 'LIKE', sourcePath + '/%')
})

const { data: source } = await useAsyncData(
  `zitate-quelle-${slug}`,
  () => queryCollection('quellen').path(sourcePath).first(),
)

const { data: page } = await useAsyncData(
  `zitate-${slug}`,
  () => queryCollection('zitate').path(basePath).first(),
)

const title = page.value?.title || 'Zitat von ' + (source.value?.name || 'unbekannter Quelle')

await definePageData({
  title: title + ' - Faktenfackel',
  pageHeading: title,
})

const lastChangeStr = page.value?.date as string | null || ''
const lastChange = dateString(lastChangeStr)

await referencesStore.fetchFor(page.value)
</script>

<template>
  <div>
    <BackLink :to="sourcePath">
      Zur Quelle "{{ source?.name }}" springen
    </BackLink>

    <div v-if="page">
      <div class="article-header">
        <div class="article-headline">
          Stand: {{ lastChange }}
        </div>
        <h1 class="article-title">
          {{ page.title }}
        </h1>
      </div>

      <div class="quote-info">
        <div class="section-block">
          <div class="section-label">
            Zitat
          </div>
          <blockquote class="quote-text">
            {{ page.title }}
          </blockquote>
        </div>

        <div
          v-if="page.tags?.length"
          class="section-block"
        >
          <div class="section-label">
            Schlagworte
          </div>
          <Tags
            :tags="page.tags"
          />
        </div>
      </div>

      <div
        v-if="page.body"
        class="article-body content"
      >
        <ContentRenderer :value="page" />
        <USeparator
          v-if="surround?.filter(Boolean).length"
          class="my-8"
        />
        <UContentSurround :surround="(surround as any)" />
      </div>
    </div>

    <div v-else>
      Nanu, diese Seite existiert nicht!
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
  margin: 0;
  line-height: 1.15;
}

.quote-info {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin-bottom: 2rem;
}

.section-label {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--flame);
  font-weight: 600;
  margin-bottom: 0.4rem;
}

.section-block {
  padding-top: 1rem;
  border-top: 1px solid var(--fackel-border);
}

.quote-text {
  font-size: 1.1rem;
  font-style: italic;
  color: var(--ink);
  border-left: 3px solid var(--flame);
  padding-left: 1rem;
  margin: 0;
  line-height: 1.6;
}

.article-body {
  margin-top: 1.5rem;
}
</style>
