<script setup lang="ts">
import { useAsyncData, useRoute } from 'nuxt/app'
import { definePageData, getSourceFromPath } from '~/utils/contentUtils'
import Tags from '~/components/sources/Tags.vue'
import SourceLinkIcon from '~/components/sources/SourceLinkIcon.vue'
import { extractCodes, referencesStore } from '~/utils/referenceData'
import { calculateSourceImg, calculateSourceImgAuthor } from '~/pages/quellen/[group]/sources'
import { handleRenameRedirects } from '~/pages/renames'

const route = useRoute()
handleRenameRedirects(route.path)

const slug = (route.params.slug as string[]).join('/')
const basePath = route.path
const sourcePath = getSourceFromPath(route.path)

const { data: surround } = await useAsyncData(`${route.path}-surround`, () => {
  return queryCollectionItemSurroundings('quellenlinks', basePath).where('path', 'LIKE', sourcePath + '/%')
})

const { data: source } = await useAsyncData(
  `quelle-${slug}`,
  () => queryCollection('quellen').path(sourcePath).first(),
)

const { data: page } = await useAsyncData(
  `quellenlink-${slug}`,
  () => queryCollection('quellenlinks').path(basePath).first(),
)

const title = 'Link: ' + (page.value?.title || '')

await definePageData({
  title: title + ' - Faktenfackel',
  pageHeading: title,
  lastmod: new Date(page.value?.date || new Date()),
})

const lastChangeStr = page.value?.date as string | null || ''
const lastChange = dateString(lastChangeStr)

const coSources = new Set(page.value?.coSources == null ? [] : page.value.coSources)

const { data: coList } = (coSources == null || coSources.size == 0)
  ? { data: [] }
  : await useAsyncData(basePath + '-coSources', () => {
      const builder = queryCollection('quellen').orWhere((query) => {
        coSources.values().forEach(s => query = query.where('path', 'LIKE', '/quellen/%/' + s))
        return query
      })
      return builder.select('name', 'path').all()
    })

referencesStore.fetchFor(extractCodes(page.value?.body))
</script>

<template>
  <div>
    <NuxtLink
      :to="sourcePath"
      style="display: inline-flex; vertical-align: middle;"
    >
      <icon
        name="i-lucide:arrow-left"
        style="margin-right: 0.5rem;"
      />
      Zur Quelle "{{ source?.name }}" springen
    </NuxtLink>

    <div v-if="page">
      <div class="article-header">
        <div class="article-headline">
          Stand: {{ lastChange }}
        </div>
        <h1 class="article-title">
          {{ page.title }}
        </h1>
      </div>

      <div class="link-info">
        <div class="link-row">
          <SourceLinkIcon :type="page.type" />
          <a
            :href="page.uri"
            rel="external"
            class="link-url"
          >{{ page.title }}</a>
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
            base-path="quellen"
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
              <lazy-nuxt-img
                :src="calculateSourceImg(source)"
                :title="calculateSourceImgAuthor(source)"
                :alt="calculateSourceImgAuthor(source)"
                class="source-img"
              />
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
        <USeparator v-if="surround?.filter(Boolean).length" />
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

.link-info {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin-bottom: 2rem;
}

.link-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.link-url {
  color: var(--flame);
  text-decoration: underline;
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
