<script setup lang="ts">
import { capitalize } from '~/utils/stringUtils'
import { definePageData, nowIso } from '~/utils/contentUtils'
import { referencesStore, type SourceLink } from '~/utils/referenceData'
import SourceLinksList from '~/components/sources/SourceLinksList.vue'
import { calculateSourceImg, calculateSourceImgAuthor, extractNameFromPath } from '~/pages/quellen/[group]/sources'

const route = useRoute()

const source = route.params.source as string
const basePath = route.path

const { data: sourceInfo }
  = await
  useAsyncData(
    `quellen-${source}`,
    () => {
      return queryCollection('quellen').path(`${basePath}`).first()
    })

const title = sourceInfo.value?.name || capitalize(source)

await definePageData({
  title: title,
  pageHeading: 'Quelle: ' + title,
  pageSubHeading: sourceInfo.value?.description || 'Quelleninformation',
  description: sourceInfo.value?.description
    ? `${title}: ${sourceInfo.value.description} – Quelleninformation, Links und Bewertung auf Faktenfackel.`
    : `Quelleninformation zu ${title} – gesammelte Links, Zitate und Faktenfackel-Bewertung.`,
  lastmod: new Date(sourceInfo.value?.date || new Date()),
})

const { data: list1 } = await useAsyncData(basePath + '/links/', () => {
  return queryCollection('quellenlinks')
    .where('path', 'LIKE', basePath + '/links/%')
    .where('date', '<=', nowIso())
    .select('date', 'title', 'uri', 'type', 'tags', 'path')
    .all()
})
const list = list1.value as SourceLink[]

const coSource = extractNameFromPath(basePath)

const { data: coList1 }
  = await useAsyncData(basePath + '-colinks', () => {
    const builder = queryCollection('quellenlinks').where('coSources', 'LIKE', '%"' + coSource + '"%').where('date', '<=', nowIso())
    return builder.all()
  })
const coList = coList1.value as SourceLink[]

const { data: quotesRaw }
  = await useAsyncData(basePath + '-quotes', () =>
    queryCollection('zitate').where('path', 'LIKE', basePath + '/%').where('date', '<=', nowIso())
      .all())
const quotes = quotesRaw.value as Quote[] || []

await referencesStore.fetchFor(sourceInfo.value)
</script>

<template>
  <div
    v-if="sourceInfo"
    class="wide"
  >
    <h1 class="source-title">
      {{ title }}
    </h1>
    <img
      :src="calculateSourceImg(sourceInfo)"
      :title="calculateSourceImgAuthor(sourceInfo)"
      :alt="calculateSourceImgAuthor(sourceInfo)"
      class="img rounded-lg"
    >
    <div
      class="text-sm italic text-gray-400"
      style="margin-top: -1.2em"
    >
      {{ calculateSourceImgAuthor(sourceInfo) }}
    </div>
    <div class="layout">
      <div
        class="intro px-2"
      >
        <ContentRenderer
          v-if="sourceInfo"
          :value="sourceInfo"
        />
      </div>
      <div
        v-if="list.length > 0 || coList.length > 0|| quotes.length > 0"
        class="sidebar"
      >
        <div
          v-if="quotes.length > 0"
        >
          <h2 class="text-2xl font-bold mt-12 mb-5">
            Zitate
          </h2>
          <QuotesList
            :list="quotes"
          />
        </div>
        <SourceLinksList
          v-if="list.length > 0"
          :list="list"
        />
        <SourceLinksList
          v-if="coList.length > 0"
          :list="coList"
          title-override="Involviert bei den Links"
        />
      </div>
    </div>
  </div>
  <div v-else>
    Quelle nicht gefunden
  </div>
</template>

<style scoped>
.source-title {
  margin: 0 0 1rem;
}

.img {
  max-width: 180px;
  max-height: 180px;
  object-fit: contain;
  margin-bottom: 1.5em;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) clamp(260px, 30%, 380px);
  gap: 2rem;
  align-items: start;
  margin-top: -2em;
}

.sidebar {
  min-width: 0;
}

.intro {
  /* Breite durch grid-column limitiert, max 65ch */
}

.intro :deep(p),
.intro :deep(ul),
.intro :deep(ol) {
  max-width: 65ch;
}

@media screen and (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .img {
    max-width: 140px;
    max-height: 140px;
    margin: 0 0 1em 0;
  }
}

p {
  margin-bottom: 1em;
}

a:hover {
  color: var(--color-secondary);
  text-decoration: underline;
}
</style>
