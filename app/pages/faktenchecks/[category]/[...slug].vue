<script setup lang="ts">
import { capitalize } from '~/utils/stringUtils'
import { definePageData } from '~/utils/contentUtils'

const route = useRoute()

const category = route.params.category as string
const slug = (route.params.slug as string[]).join('/')

const categoryPath = `/faktenchecks/${category}`
const basePath = route.path// ``/faktenchecks/${category}/${slug}`;

const { data: surround } = await useAsyncData(`${route.path}-surround`, () => {
  return queryCollectionItemSurroundings('faktenchecks', basePath, {
    fields: ['description'],
  })
})

const { data: page }
  = await
  useAsyncData(
    `faktencheck-${slug}`,
    () => {
      return queryCollection('faktenchecks').path(basePath).first()
    })

const title = page.value?.title || `Faktencheck`
const subtitle = page.value?.meta.subtitle || `Faktencheck`

await definePageData({
  title: title + ' - Faktenfackel',
  pageHeading: title,
  pageSubHeading: subtitle as string,
  description: page.value?.description,
})
</script>

<template>
  <div>
    <NuxtLink
      :to="categoryPath"
      style="display: inline-flex;
    vertical-align: middle;"
    >
      <icon
        name="i-lucide:arrow-left"
        style="margin-right: 0.5rem;"
      />
      Zurück zum Bereich {{ capitalize(category) }}
    </NuxtLink>
    <UPage v-if="page">
      <UPageHeader :title="page.title" />

      <UPageBody>
        <ContentRenderer
          v-if="page.body"
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
      Diese Seite existiert nicht!
    </div>
  </div>
</template>
