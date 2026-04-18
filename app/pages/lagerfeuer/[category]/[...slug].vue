<script setup lang="ts">
import { useAsyncData, useRoute } from 'nuxt/app'
import { definePageData, nowIso } from '~/utils/contentUtils'
import { useReferencesStore } from '~/utils/referenceData'

definePageMeta({ key: route => route.fullPath })

const route = useRoute()
const referencesStore = useReferencesStore()
const category = route.params.category as string
const slug = (route.params.slug as string[]).join('/')
const categoryPath = `/lagerfeuer/${category}`
const basePath = route.path

// Series detection: path has 5+ segments → /lagerfeuer/category/series/article
const pathSegments = basePath.split('/')
const isSeries = pathSegments.length >= 5
const seriesPath = isSeries ? pathSegments.slice(0, -1).join('/') : null

function chapterLabel(part: number | undefined): string {
  if (part == null) return ''
  if (part === 0) return 'Einleitung'
  return `Teil ${part}`
}

// Global surround only for non-series articles
const { data: surround } = isSeries
  ? { data: ref(null) }
  : await useAsyncData(`${route.path}-surround`, () => {
      return queryCollectionItemSurroundings('lagerfeuer', basePath, {
        fields: ['subtitle'],
      }).where('path', 'NOT LIKE', '%_info').where('publishedOn', '<=', nowIso())
    })

// Series chapter navigation
type SeriesChapter = { title: string, path: string, part: number }
const { data: seriesChapters } = isSeries
  ? await useAsyncData(`series-${seriesPath}`, () =>
      queryCollection('lagerfeuer')
        .where('path', 'LIKE', seriesPath + '/%')
        .where('publishedOn', '<=', nowIso())
        .order('part', 'ASC')
        .all() as Promise<SeriesChapter[]>,
    )
  : { data: ref<SeriesChapter[] | null>(null) }

const currentSeriesIndex = computed(() =>
  seriesChapters.value?.findIndex(c => c.path === basePath) ?? -1,
)
const firstChapter = computed(() => seriesChapters.value?.[0] ?? null)
const prevChapter = computed(() =>
  currentSeriesIndex.value > 0 ? (seriesChapters.value?.[currentSeriesIndex.value - 1] ?? null) : null,
)
const nextChapter = computed(() =>
  seriesChapters.value?.[currentSeriesIndex.value + 1] ?? null,
)

const { data: page } = await useAsyncData(
  `lagerfeuer-${slug}`,
  () => queryCollection('lagerfeuer').path(basePath).where('publishedOn', '<=', nowIso()).first(),
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Beitrag nicht gefunden' })
}

const title = page.value?.title || `Lagerfeuer`
const subtitle = page.value?.subtitle || ``
const displayChapterLabel = chapterLabel(page.value?.part)

await definePageData({
  title: (displayChapterLabel ? `${displayChapterLabel}: ` : '') + title + ' - Faktenfackel',
  pageHeading: title,
  pageSubHeading: subtitle as string,
  description: page.value?.description,
  lastmod: new Date(page.value?.date || new Date()),
})

useSeoMeta({
  title: (displayChapterLabel ? `${displayChapterLabel}: ` : '') + title + ' - Faktenfackel',
  description: page.value?.description || subtitle,
  articleModifiedTime: page.value?.date || new Date().toLocaleDateString(),
})

defineOgImage('Lagerfeuer', {
  title,
})

const lastChangeStr = page.value?.date as string | null || ''
const lastChange = dateString(lastChangeStr)

const publishedOnStr = page.value?.publishedOn as string | null || ''
const isPublished = publishedOnStr && new Date(publishedOnStr) <= new Date()
const publishedOnLabel = isPublished ? dateString(publishedOnStr) : ''
const showLastChange = isPublished
  ? publishedOnStr.slice(0, 10) !== lastChangeStr.slice(0, 10)
  : true

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
    <BackLink :to="(isSeries && seriesPath) || categoryPath || '/lagerfeuer'">
      {{ isSeries ? 'Zur Serie' : `Zurück zum Bereich ${capitalize(category)}` }}
    </BackLink>

    <div v-if="page">
      <div class="article-shell">
        <div class="article-header">
          <div class="article-headline">
            <span
              v-if="displayChapterLabel"
              class="article-chapter-label"
            >{{ displayChapterLabel }}</span>
            <span
              v-if="displayChapterLabel"
              class="article-headline-sep"
            >·</span>
            <template v-if="isPublished">
              Veröffentlicht am <time :datetime="publishedOnStr">{{ publishedOnLabel }}</time>
              <template v-if="showLastChange">
                <span class="article-headline-sep">·</span>
                Stand: <time :datetime="lastChangeStr">{{ lastChange }}</time>
              </template>
            </template>
            <template v-else>
              Stand: <time :datetime="lastChangeStr">{{ lastChange }}</time>
            </template>
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
        <UAlert
          v-if="page.tags?.includes('research-done-review-pending')"
          color="orange"
          variant="subtle"
          icon="i-lucide-eye"
          title="Dieser Inhalt wurde recherchiert, aber noch nicht final geprüft."
          class="article-alert review-alert"
        />
        <UAlert
          v-if="page.tags?.includes('more-research-needed')"
          color="neutral"
          variant="subtle"
          icon="i-lucide-search"
          title="Dieser Inhalt ist noch rudimentär und wird bald erweitert."
          class="article-alert"
        />

        <div class="article-body content">
          <ContentRenderer
            v-if="page.body"
            :value="page"
          />

          <!-- Series navigation for chapter articles -->
          <template v-if="isSeries && seriesChapters?.length">
            <USeparator class="my-8" />
            <nav class="series-nav">
              <NuxtLink
                v-if="prevChapter"
                :to="prevChapter.path"
                class="series-nav__item series-nav__prev"
              >
                <span class="series-nav__dir">← {{ chapterLabel(prevChapter.part) }}</span>
                <span class="series-nav__title">{{ prevChapter.title }}</span>
              </NuxtLink>
              <div
                v-else
                class="series-nav__item series-nav__placeholder"
              />
              <NuxtLink
                v-if="firstChapter && firstChapter.path !== basePath"
                :to="seriesPath!"
                class="series-nav__overview"
              >
                Zur Serienübersicht
              </NuxtLink>
              <NuxtLink
                v-if="nextChapter"
                :to="nextChapter.path"
                class="series-nav__item series-nav__next"
              >
                <span class="series-nav__dir">{{ chapterLabel(nextChapter.part) }} →</span>
                <span class="series-nav__title">{{ nextChapter.title }}</span>
              </NuxtLink>
              <div
                v-else
                class="series-nav__item series-nav__placeholder"
              />
            </nav>
          </template>

          <!-- Global surround for regular articles -->
          <template v-else-if="surround?.filter(Boolean).length">
            <USeparator class="my-8" />
            <UContentSurround :surround="(surround as any)">
              <template #link-description="{ link }">
                {{ link?.subtitle || link?.description }}
              </template>
            </UContentSurround>
          </template>
        </div>
      </div>
    </div>

    <div v-else>
      Diese Seite existiert nicht!
    </div>
  </div>
</template>

<style scoped>
.review-alert :deep([class*="icon"]) {
  color: var(--flame);
}

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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.article-headline-sep {
  opacity: 0.4;
}

.article-chapter-label {
  font-weight: 700;
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

/* Series navigation */
.series-nav {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0.75rem;
  align-items: start;
}

.series-nav__item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.9rem 1rem;
  border: 1px solid var(--fackel-border);
  border-radius: 0.75rem;
  background: #faf7f2;
  text-decoration: none;
  transition: background 0.15s, border-color 0.15s;
}

.series-nav__item:hover {
  background: #f3ede4;
  border-color: var(--flame);
}

.series-nav__placeholder {
  background: transparent;
  border-color: transparent;
}

.series-nav__next {
  text-align: right;
  align-items: flex-end;
}

.series-nav__dir {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--flame);
  font-weight: 600;
}

.series-nav__title {
  font-size: 0.95rem;
  color: var(--ink);
  line-height: 1.35;
}

.series-nav__overview {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 0.9rem;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--muted);
  text-decoration: none;
  border: 1px solid var(--fackel-border);
  border-radius: 0.75rem;
  white-space: nowrap;
  transition: color 0.15s, border-color 0.15s;
}

.series-nav__overview:hover {
  color: var(--flame);
  border-color: var(--flame);
}

@media screen and (max-width: 560px) {
  .article-header {
    padding: 1.8rem 1.2rem 1.3rem;
  }

  .article-body {
    padding: 1.25rem 1.2rem 2rem;
  }

  .series-nav {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }

  .series-nav__next {
    text-align: left;
    align-items: flex-start;
  }

  .series-nav__overview {
    justify-content: flex-start;
  }
}
</style>
