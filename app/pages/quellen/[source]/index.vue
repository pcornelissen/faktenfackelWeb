<script setup lang="ts">
import { capitalize } from '~/utils/stringUtils'
import { definePageData, type SourceLink } from '~/utils/contentUtils'
import SourceLinksList from '~/components/sources/SourceLinksList.vue'

const route = useRoute()

const source = route.params.source as string
const basePath = route.path// `/quellen/${source}`;

const { data: sourceInfo }
  = await
  useAsyncData(
    `faktencheck-${source}`,
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
    .select('date', 'title', 'uri', 'type', 'tags', 'path')
    .all()
})
const list = list1.value as SourceLink[]
</script>

<template>
  <div>
    <lazy-nuxt-img
      v-if="sourceInfo?.image"
      :src="sourceInfo.image"
      style="max-width: 80%; margin-bottom: 1em;max-height: 15em"
    />
    <div
      class="flex flex-row"
      style="margin-top: -2em"
    >
      <div
        class="intro px-2"
        style="max-width: 40%"
      >
        <ContentRenderer
          v-if="sourceInfo"
          :value="sourceInfo"
        />
      </div>
      <SourceLinksList
        :list="list"
        :base-path="route.path"
      />
    </div>
  </div>
</template>

<style scoped>
h2{
  margin-top: 0em;
}
</style>
