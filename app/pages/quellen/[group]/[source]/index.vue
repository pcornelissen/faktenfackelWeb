<script setup lang="ts">
import { capitalize } from '~/utils/stringUtils'
import { definePageData } from '~/utils/contentUtils'
import { extractCodes, referencesStore, type SourceLink } from '~/utils/referenceData'
import SourceLinksList from '~/components/sources/SourceLinksList.vue'
import { calculateSourceImg, calculateSourceImgAuthor, extractNameFromPath } from '~/pages/quellen/[group]/sources'
import { handleRenameRedirects } from '~/pages/renames'

const route = useRoute()

const source = route.params.source as string
const basePath = route.path// `/quellen/${source}`;

handleRenameRedirects(route.path)

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
})

const { data: list1 } = await useAsyncData(basePath + '/links/', () => {
  return queryCollection('quellenlinks')
    .where('path', 'LIKE', basePath + '/links/%')
    .select('date', 'title', 'uri', 'type', 'tags', 'path')
    .all()
})
const list = list1.value as SourceLink[]

const coSource = extractNameFromPath(basePath)

const { data: coList1 }
  = await useAsyncData(basePath + '-colinks', () => {
    const builder = queryCollection('quellenlinks').where('coSources', 'LIKE', '%"' + coSource + '"%')
    return builder.all()
  })
const coList = coList1.value as SourceLink[]

const { data: quotesRaw }
  = await useAsyncData(basePath + '-quotes', () =>
    queryCollection('zitate').where('path', 'LIKE', basePath + '/%')
      .all())
console.log('quotesRaw', quotesRaw.value, basePath + '/%/')
const quotes = quotesRaw.value as Quote[] || []

referencesStore.fetchFor(extractCodes(sourceInfo.value?.body))
</script>

<template>
  <div v-if="sourceInfo">
    <lazy-nuxt-img
      :src="calculateSourceImg(sourceInfo)"
      :title="calculateSourceImgAuthor(sourceInfo)"
      :alt="calculateSourceImgAuthor(sourceInfo)"
      placeholder="/files/no-img.svg"
      placeholder-class="placeholder-img rounded-lg p-2"
      class="img rounded-lg"
      style="max-width: 80em"
    />
    <div
      class="text-sm italic text-gray-400"
      style="margin-top: -1.2em"
    >
      {{ calculateSourceImgAuthor(sourceInfo) }}
    </div>
    <div
      class="layout"
      style="margin-top: -2em"
    >
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
h2 {
  margin-top: 0;
}

.layout {
  @apply flex;
  @apply flex-row;
}

.img {
  max-width: 80%;
  margin-bottom: 1em;
  max-height: 15em;
}

.intro {
  max-width: 60%;
}

@media screen and (max-width: 900px) {
  .layout {
    @apply flex-col;
  }

  .img {
    max-width: 100%;
    margin: 1em;
  }

  .intro {
    max-width: 100%;
  }
}

p {
  margin-bottom: 1em;
}

a:hover {
  color: var(--color-secondary);
  @apply underline;
}
</style>
