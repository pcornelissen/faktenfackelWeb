<script setup lang="ts">
import { useAsyncData, useRoute } from 'nuxt/app'
import { definePageData, getSourceFromPath } from '~/utils/contentUtils'
import SourceLinkTags from '~/components/sources/SourceLinkTags.vue'
import SourceLinkIcon from '~/components/sources/SourceLinkIcon.vue'
import { referencesStore, extractCodes } from '~/utils/referenceData'

const route = useRoute()

const slug = (route.params.slug as string[]).join('/')

const basePath = route.path

const sourcePath = getSourceFromPath(route.path)

const { data: surround } = await useAsyncData(`${route.path}-surround`, () => {
  return queryCollectionItemSurroundings('quellenlinks', basePath).where('path', 'LIKE', sourcePath + '/%')
})

const { data: source }
  = await
  useAsyncData(
    `quelle-${slug}`,
    () => {
      return queryCollection('quellen').path(sourcePath).first()
    })

const { data: page }
  = await
  useAsyncData(
    `quellenlink-${slug}`,
    () => {
      return queryCollection('quellenlinks').path(basePath).first()
    })

const title = 'Link: ' + (page.value?.title || '')

await definePageData({
  title: title + ' - Faktenfackel',
  pageHeading: title,
})

const lastChangeStr = page.value?.date as string | null || ''
const lastChange = new Date(lastChangeStr).toLocaleDateString('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const coSources = new Set(page.value?.coSources == null ? [] : page.value.coSources)

const { data: coList }
  = (coSources == null || coSources.size == 0)
    ? { data: [] }
    : await useAsyncData(basePath + '-coSources', () => {
        const builder = queryCollection('quellen').orWhere(
          (query) => {
            coSources.values().forEach(s => query = query.where('path', 'LIKE', '/quellen/%/' + s))
            return query
          },
        )
        return builder
          .select('name', 'path')
          .all()
      })

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
      <h2>Link</h2>
      <div
        class="flex-auto ml-2 row"
      >
        <div class="flex  ">
          <SourceLinkIcon
            :type="page.type"
          />
          <a
            :href="page.uri"
            rel="external"
            class="link  "
          >
            {{ page.title }}
          </a>
        </div>
        <div class="italic text-sm ml-5">
          (Stand: {{ lastChange }})
        </div>
      </div>
      <h2>Schlagworte</h2>
      <SourceLinkTags :tags="page.tags" />
      <h2>Quelle</h2>
      <div
        v-if="source"
        class="source-link"
      >
        <a
          :href="source.path"
        >
          <lazy-nuxt-img
            v-if="source?.image"
            :src="source.image"
            class="source-img"
          />
          <span class="source-name">{{ source.name }}</span></a>
      </div>
      <div
        v-else
        class="text-red-500"
      >
        Quelle konnte nicht geladen werden!
      </div>

      <template v-if="coList && coList.length>0">
        <h2>Weitere beteiligte Quelle{{ coList.length > 1 ? 'n' : '' }}</h2>
        <ul class="list-disc ml-4">
          <li
            v-for="co in coList"
            :key="co.path"
          >
            <nuxt-link :to="co.path">{{ co.name }}</nuxt-link>
          </li>
        </ul>
      </template>

      <UPageBody v-if="page.body">
        <h2 class="mb-2">
          Link Beschreibung
        </h2>
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
