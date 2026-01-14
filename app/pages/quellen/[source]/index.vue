<script setup lang="ts">
import { capitalize } from '~/utils/stringUtils'
import { definePageData } from '~/utils/contentUtils'
import SourceLinksList from '~/components/sources/SourceLinksList.vue'
import type { SourceLink } from '~/utils/referenceData'

const route = useRoute()

const source = route.params.source as string
const basePath = route.path// `/quellen/${source}`;

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

const coSource = basePath.split('/').pop()

const { data: coList1 }
  = await useAsyncData(basePath + '-colinks', () => {
    const builder = queryCollection('quellenlinks').where('coSources', 'LIKE', '%"' + coSource + '"%')
    return builder
      .select('date', 'title', 'uri', 'type', 'tags', 'path')
      .all()
  })
const coList = coList1.value as SourceLink[]
</script>

<template>
  <div>
    <lazy-nuxt-img
      v-if="sourceInfo?.image"
      :src="sourceInfo.image"
      class="img"
    />
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
        v-if="list.length > 0 || coList.length > 0"
      >
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
