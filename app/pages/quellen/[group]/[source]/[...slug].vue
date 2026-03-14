<script setup lang="ts">
import { useAsyncData, useRoute } from 'nuxt/app'
import { definePageData, getSourceFromPath, nowIso } from '~/utils/contentUtils'
import Tags from '~/components/sources/Tags.vue'
import SourceLinkIcon from '~/components/sources/SourceLinkIcon.vue'
import { referencesStore } from '~/utils/referenceData'
import { calculateSourceImg, calculateSourceImgAuthor } from '~/pages/quellen/[group]/sources'

const route = useRoute()

const slug = (route.params.slug as string[]).join('/')
const basePath = route.path
const sourcePath = getSourceFromPath(route.path)

const { data: surround } = await useAsyncData(`${route.path}-surround`, () => {
  return queryCollectionItemSurroundings('quellenlinks', basePath).where('path', 'LIKE', sourcePath + '/%').where('date', '<=', nowIso())
})

const { data: source } = await useAsyncData(
  `quelle-${slug}`,
  () => queryCollection('quellen').path(sourcePath).first(),
)

const { data: page } = await useAsyncData(
  `quellenlink-${slug}`,
  () => queryCollection('quellenlinks').path(basePath).where('date', '<=', nowIso()).first(),
)

const title = 'Link: ' + (page.value?.title || '')

await definePageData({
  title: title + ' - Faktenfackel',
  pageHeading: title,
  lastmod: new Date(page.value?.date || new Date()),
})

const lastChangeStr = page.value?.date as string | null || ''
const lastChange = dateString(lastChangeStr)

useSeoMeta({
  ogUrl: `https://faktenfackel.de${route.path}`,
  twitterCard: 'summary_large_image',
})

useClaimReview({
  title: page.value?.title || title,
  url: route.path,
  datePublished: page.value?.date,
  verdict: page.value?.verdict,
  author: source.value?.name,
})

const coSources = new Set(page.value?.coSources == null ? [] : page.value.coSources)

const { data: coList } = (coSources == null || coSources.size == 0)
  ? { data: [] }
  : await useAsyncData(basePath + '-coSources', () => {
      return queryCollection('quellen')
        .orWhere((q) => {
          for (const s of coSources.values()) {
            q.where('path', 'LIKE', '/quellen/%/' + s)
          }
          return q
        })
        .select('name', 'path').all()
    })

await referencesStore.fetchFor(page.value)

const code = page.value?.code
const [{ data: usedInFaktenchecks }, { data: usedInLagerfeuer }, { data: usedInQuellenlinks }] = code
  ? await Promise.all([
      useAsyncData(basePath + '-used-faktenchecks', () =>
        queryCollection('faktenchecks')
          .where('referenceCodes', 'LIKE', '%' + code + '%')
          .where('date', '<=', nowIso())
          .select('title', 'subtitle', 'path', 'verdict', 'date', 'publishedOn', 'tags')
          .all(),
      ),
      useAsyncData(basePath + '-used-lagerfeuer', () =>
        queryCollection('lagerfeuer')
          .where('referenceCodes', 'LIKE', '%' + code + '%')
          .where('date', '<=', nowIso())
          .select('title', 'subtitle', 'path', 'date', 'publishedOn', 'tags')
          .all(),
      ),
      useAsyncData(basePath + '-used-quellenlinks', () =>
        queryCollection('quellenlinks')
          .where('referenceCodes', 'LIKE', '%' + code + '%')
          .where('date', '<=', nowIso())
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
      <div class="article-header">
        <div class="article-headline">
          Stand: {{ lastChange }}
        </div>
        <h1 class="article-title">
          {{ page.title }}
        </h1>
      </div>
      <VerdictLabel
        v-if="page.verdict !== undefined"
        :type="page.verdict"
        class="article-verdict"
      />

      <div class="link-info">
        <a
          :href="page.uri"
          rel="external"
          class="link-row"
        >
          <SourceLinkIcon :type="page.type" />
          <span class="link-url">{{ page.uri }}</span>
          <UIcon
            name="i-lucide:external-link"
            class="link-external-icon"
          />
        </a>

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

        <div class="section-block">
          <div class="section-label">
            Quelle
          </div>
          <div
            v-if="source"
            class="source-link"
          >
            <a :href="source.path">
              <img
                :src="calculateSourceImg(source)"
                :title="calculateSourceImgAuthor(source)"
                :alt="calculateSourceImgAuthor(source)"
                class="source-img"
              >
              <span class="source-name">{{ source.name }}</span>
            </a>
          </div>
          <div
            v-else
            class="text-red-500"
          >
            Quelle konnte nicht geladen werden!
          </div>
        </div>

        <div
          v-if="coList && coList.length > 0"
          class="section-block"
        >
          <div class="section-label">
            Weitere beteiligte Quelle{{ coList.length > 1 ? 'n' : '' }}
          </div>
          <ul class="list-disc ml-4">
            <li
              v-for="co in coList"
              :key="co.path"
            >
              <nuxt-link :to="co.path">{{ co.name }}</nuxt-link>
            </li>
          </ul>
        </div>
      </div>

      <div
        v-if="page.body"
        class="article-body content"
      >
        <h2>Link Beschreibung</h2>
        <ContentRenderer :value="page" />

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

.article-verdict {
  display: inline-block;
  margin: 0.5rem 0 0;
}

.link-info {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin-bottom: 2rem;
}

.link-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--fackel-border);
  border-radius: 0.4rem;
  background: var(--paper);
  text-decoration: none;
  transition: border-color 0.15s, background 0.15s;
}

.link-row:hover {
  border-color: var(--flame);
  background: #fff;
}

.link-url {
  flex: 1;
  color: var(--flame);
  font-size: 0.875rem;
  word-break: break-all;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.link-row:hover .link-url {
  color: var(--ember);
}

.link-external-icon {
  flex-shrink: 0;
  color: var(--muted);
  opacity: 0.6;
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

.source-img {
  max-width: 15rem;
  max-height: 5rem;
  display: inline;
  margin-right: 1rem;
}

.source-name {
  font-weight: bold;
}

.source-link {
  border-radius: 4px;
  transition: background 0.15s;
  width: fit-content;
  padding: 0.4rem 0.8rem;
}

.source-link:hover {
  background-color: #FAF6F0;
}

.article-body {
  margin-top: 1.5rem;
}
</style>
