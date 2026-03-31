<script setup lang="ts">
import { useAsyncData, useRoute } from 'nuxt/app'
import { definePageData, nowIso } from '~/utils/contentUtils'
import { referencesStore } from '~/utils/referenceData'

const route = useRoute()
const category = route.params.category as string
const slug = (route.params.slug as string[]).join('/')
const categoryPath = `/lagerfeuer/${category}`
const basePath = route.path

const { data: surround } = await useAsyncData(`${route.path}-surround`, () => {
  return queryCollectionItemSurroundings('lagerfeuer', basePath, {
    fields: ['subtitle'],
  }).where('path', 'NOT LIKE', '%_info').where('publishedOn', '<=', nowIso())
})

const { data: page } = await useAsyncData(
  `lagerfeuer-${slug}`,
  () => queryCollection('lagerfeuer').path(basePath).where('publishedOn', '<=', nowIso()).first(),
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Beitrag nicht gefunden' })
}

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

defineOgImage('Lagerfeuer', {
  title,
})

const lastChangeStr = page.value?.date as string | null || ''
const lastChange = dateString(lastChangeStr)

useBlogPosting({
  title,
  description: page.value?.description || (subtitle as string) || undefined,
  url: basePath,
  datePublished: page.value?.publishedOn as string | undefined,
  dateModified: page.value?.date as string | undefined,
  tags: page.value?.tags as string[] | undefined,
})

await referencesStore.fetchFor(page.value)
</script>

<template>
  <div>
    <BackLink :to="categoryPath">
      Zurück zum Bereich {{ capitalize(category) }}
    </BackLink>

    <div v-if="page">
      <div class="article-shell">
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
          <Tags
            v-if="page.tags?.length"
            :tags="(page.tags as string[])"
            class="article-tags"
          />
        </div>

        <UAlert
          v-if="!page.publishedOn || new Date(page.publishedOn) > new Date()"
          type="info"
          icon="i-lucide-badge-info"
          title="Achtung! Dieser Artikel ist aktuell in Bearbeitung und kann fehlende, falsche und unbelegte Informationen enthalten"
          class="article-alert"
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
    </div>

    <div v-else>
      Diese Seite existiert nicht!
    </div>
  </div>
</template>

<style scoped>
.article-shell {
  background: rgba(255, 255, 255, 0.68);
  border: 1px solid rgba(231, 222, 208, 0.9);
  border-radius: 1.6rem;
  box-shadow: 0 18px 50px rgba(47, 26, 11, 0.06);
  overflow: hidden;
}

.article-header {
  padding: 2.5rem 2.75rem 1.7rem;
  background:
    radial-gradient(circle at top right, rgba(232, 68, 10, 0.1), transparent 32%),
    linear-gradient(180deg, white, #FCF8F3);
  border-bottom: 1px solid var(--fackel-border);
}

.article-headline {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--flame);
  margin-bottom: 0.9rem;
}

.article-title {
  margin: 0 0 0.8rem;
  line-height: 0.98;
  letter-spacing: -0.04em;
  font-size: clamp(2.4rem, 5vw, 4rem);
  max-width: 12ch;
}

.article-subtitle {
  font-size: clamp(1.2rem, 2vw, 1.45rem);
  color: var(--muted);
  font-weight: 400;
  margin: 0;
  line-height: 1.48;
  max-width: 34ch;
}

.article-tags {
  margin-top: 0.9rem;
}

.article-alert {
  margin: 1.3rem 1.5rem 0;
}

.article-body {
  margin-top: 0;
  padding: 1.8rem 2.75rem 2.8rem;
}

@media screen and (max-width: 560px) {
  .article-header {
    padding: 1.8rem 1.2rem 1.3rem;
  }

  .article-body {
    padding: 1.25rem 1.2rem 2rem;
  }
}
</style>
