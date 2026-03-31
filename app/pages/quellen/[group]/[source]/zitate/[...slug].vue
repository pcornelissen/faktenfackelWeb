<script setup lang="ts">
import { useAsyncData, useRoute } from 'nuxt/app'
import { definePageData, getSourceFromPath, nowIso } from '~/utils/contentUtils'
import Tags from '~/components/sources/Tags.vue'
import { referencesStore } from '~/utils/referenceData'

const route = useRoute()

const slug = (route.params.slug as string[]).join('/')
const basePath = route.path
const sourcePath = getSourceFromPath(route.path)

const { data: surround } = await useAsyncData(`${route.path}-surround`, () => {
  return queryCollectionItemSurroundings('zitate', basePath).where('path', 'LIKE', sourcePath + '/%').where('publishedOn', '<=', nowIso())
})

const { data: source } = await useAsyncData(
  `zitate-quelle-${slug}`,
  () => queryCollection('quellen').path(sourcePath).first(),
)

const { data: page } = await useAsyncData(
  `zitate-${slug}`,
  () => queryCollection('zitate').path(basePath).where('publishedOn', '<=', nowIso()).first(),
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Zitat nicht gefunden' })
}

const title = page.value?.title || 'Zitat von ' + (source.value?.name || 'unbekannter Quelle')
const sourceNameForDesc = source.value?.name || ''

await definePageData({
  title: title + ' - Faktenfackel',
  pageHeading: title,
  description: sourceNameForDesc
    ? `Zitat von ${sourceNameForDesc}: „${page.value?.title || ''}" – Kontext und Einordnung auf Faktenfackel.`
    : `Zitat: „${page.value?.title || ''}" – Kontext und Einordnung auf Faktenfackel.`,
})

const lastChangeStr = page.value?.date as string | null || ''
const lastChange = dateString(lastChangeStr)

await referencesStore.fetchFor(page.value)

const code = page.value?.code
const [{ data: usedInFaktenchecks }, { data: usedInLagerfeuer }, { data: usedInQuellenlinks }] = code
  ? await Promise.all([
      useAsyncData(basePath + '-used-faktenchecks', () =>
        queryCollection('faktenchecks')
          .where('quoteCodes', 'LIKE', '%' + code + '%')
          .where('publishedOn', '<=', nowIso())
          .select('title', 'subtitle', 'path', 'verdict', 'date', 'publishedOn', 'tags')
          .all(),
      ),
      useAsyncData(basePath + '-used-lagerfeuer', () =>
        queryCollection('lagerfeuer')
          .where('quoteCodes', 'LIKE', '%' + code + '%')
          .where('publishedOn', '<=', nowIso())
          .select('title', 'subtitle', 'path', 'date', 'publishedOn', 'tags')
          .all(),
      ),
      useAsyncData(basePath + '-used-quellenlinks', () =>
        queryCollection('quellenlinks')
          .where('quoteCodes', 'LIKE', '%' + code + '%')
          .where('publishedOn', '<=', nowIso())
          .select('title', 'path', 'date')
          .all(),
      ),
    ])
  : [{ data: ref([]) }, { data: ref([]) }, { data: ref([]) }]
</script>

<template>
  <div>
    <BackLink :to="sourcePath">
      Zur Quelle "{{ source?.name }}" springen
    </BackLink>

    <div v-if="page">
      <UAlert
        v-if="page.tags?.includes('research-done-review-pending')"
        color="orange"
        variant="subtle"
        icon="i-lucide-eye"
        title="Dieser Inhalt wurde recherchiert, aber noch nicht final geprüft."
        class="mb-4 review-alert"
      />
      <UAlert
        v-if="page.tags?.includes('more-research-needed')"
        color="neutral"
        variant="subtle"
        icon="i-lucide-search"
        title="Dieser Inhalt ist noch rudimentär und wird bald erweitert."
        class="mb-4"
      />

      <div class="article-shell">
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
          v-if="page.body || usedInFaktenchecks?.length || usedInLagerfeuer?.length || usedInQuellenlinks?.length"
          class="article-body content"
        >
          <ContentRenderer
            v-if="page.body"
            :value="page"
          />

          <template v-if="usedInFaktenchecks?.length || usedInLagerfeuer?.length || usedInQuellenlinks?.length">
            <h2>Verwendungen</h2>
            <template v-if="usedInFaktenchecks?.length">
              <h3>Faktenchecks</h3>
              <PostsList
                :list="(usedInFaktenchecks as any)"
                icon="mdi:magnify"
                :page-size="100"
              />
            </template>
            <template v-if="usedInLagerfeuer?.length">
              <h3>Lagerfeuer</h3>
              <PostsList
                :list="(usedInLagerfeuer as any)"
                icon="mdi:book-open-variant"
                :page-size="100"
              />
            </template>
            <template v-if="usedInQuellenlinks?.length">
              <h3>Weitere Quellenlinks</h3>
              <PostsList
                :list="(usedInQuellenlinks as any)"
                icon="mdi:link-variant"
                :page-size="100"
              />
            </template>
          </template>

          <USeparator
            v-if="surround?.filter(Boolean).length"
            class="my-8"
          />
          <UContentSurround :surround="(surround as any)" />
        </div>
      </div>
    </div>

    <div v-else>
      Nanu, diese Seite existiert nicht!
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
  padding: 2.5rem 2.75rem 1.4rem;
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
  margin: 0;
  line-height: 0.98;
  letter-spacing: -0.04em;
  font-size: clamp(2.2rem, 4.5vw, 3.8rem);
  max-width: 13ch;
  text-wrap: balance;
}

.quote-info {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin: 0;
  padding: 1.25rem 2.75rem 0;
}

.section-label {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--flame);
  font-weight: 600;
  margin-bottom: 0.4rem;
}

.section-block {
  padding-top: 0.35rem;
}

.quote-text {
  font-size: clamp(1.35rem, 2vw, 1.7rem);
  font-style: italic;
  color: var(--ink);
  border-left: 4px solid var(--flame);
  padding-left: 1rem;
  margin: 0;
  line-height: 1.55;
  background: #FCF7F0;
  border-radius: 0 1rem 1rem 0;
  padding-top: 1rem;
  padding-bottom: 1rem;
  padding-right: 1rem;
  text-wrap: pretty;
}

.article-body {
  margin-top: 0;
  padding: 1.8rem 2.75rem 2.8rem;
}

@media screen and (max-width: 560px) {
  .article-header {
    padding: 1.65rem 1.05rem 1.15rem;
  }

  .article-headline {
    font-size: 0.72rem;
    letter-spacing: 0.09em;
    margin-bottom: 0.75rem;
  }

  .article-title {
    max-width: 10ch;
  }

  .quote-info,
  .article-body {
    padding-left: 1.05rem;
    padding-right: 1.05rem;
  }

  .quote-info {
    gap: 0.95rem;
    padding-top: 1rem;
  }

  .section-label {
    font-size: 0.72rem;
    letter-spacing: 0.09em;
  }

  .quote-text {
    font-size: 1.16rem;
    line-height: 1.45;
    padding: 0.8rem 0.85rem 0.8rem 0.85rem;
    border-left-width: 3px;
    border-radius: 0 0.85rem 0.85rem 0;
  }

  .article-body {
    padding-bottom: 1.8rem;
  }
}
</style>
