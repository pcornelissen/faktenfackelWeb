<script setup lang="ts">
import { useAsyncData, useRoute } from 'nuxt/app'
import { definePageData, getSourceFromPath } from '~/utils/contentUtils'
import Tags from '~/components/sources/Tags.vue'
import { referencesStore, extractCodes } from '~/utils/referenceData'
import { handleRenameRedirects } from '~/pages/renames'

const route = useRoute()
handleRenameRedirects(route.path)

const slug = (route.params.slug as string[]).join('/')

const basePath = route.path

const sourcePath = getSourceFromPath(route.path)

const { data: surround } = await useAsyncData(`${route.path}-surround`, () => {
  return queryCollectionItemSurroundings('zitate', basePath).where('path', 'LIKE', sourcePath + '/%')
})

const { data: source }
  = await
  useAsyncData(
    `zitate-quelle-${slug}`,
    () => {
      return queryCollection('quellen').path(sourcePath).first()
    })

const { data: page }
  = await
  useAsyncData(
    `zitate-${slug}`,
    () => {
      return queryCollection('zitate').path(basePath).first()
    })

const title = (page.value?.title || 'Zitat von ' + source.value?.name || 'unbekannter Quelle')

await definePageData({
  title: title + ' - Faktenfackel',
  pageHeading: title,
})

const lastChangeStr = page.value?.date as string | null || ''
const lastChange = dateString(lastChangeStr)

referencesStore.fetchFor(extractCodes(page.value?.body))
</script>

<template>
  <div>
    <NuxtLink
      :to="sourcePath"
      style="display: inline-flex;
    vertical-align: middle;"
    >
      <icon
        name="i-lucide:arrow-left"
        style="margin-right: 0.5rem;"
      />
      Zur Quelle "{{ source?.name }}" springen
    </NuxtLink>
    <UPage
      v-if="page"
      style="width:fit-content"
    >
      <h2>Zitat</h2>
      <div
        class="flex-auto ml-2 row"
      >
        <div class="flex  ">
          {{ page.title }}
        </div>
        <div class="italic text-sm ml-5">
          (Stand: {{ lastChange }})
        </div>
      </div>
      <h2>Schlagworte</h2>
      <Tags
        :tags="page.tags"
        base-path="/zitate"
      />
      <UPageBody v-if="page.body">
        <ContentRenderer
          :value="page"
        />

        <USeparator v-if="surround?.filter(Boolean).length" />

        <UContentSurround :surround="(surround as any)" />
      </UPageBody>

      <template
        v-if="page?.body?.toc?.links?.length"
        #right
      >
        <UContentToc
          :links="page.body.toc.links"
          title="Inhalt"
        />
      </template>
    </UPage>
    <div v-else>
      Nanu, diese Seite existiert nicht!
    </div>
  </div>
</template>

<style scoped>
p {
  margin-bottom: 1em;
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
  border-radius: 0.5rem;
  transition: ease all .5s;
  width: fit-content;
  padding-left: 0.5rem;
  padding-right: 1rem;
}

.source-link:hover {
  background-color: #eee;
  transition: ease all .5s;

}

a:hover {
  color: var(--color-secondary);
  @apply underline;
}
</style>
