<script setup lang="ts">
import { definePageData } from '~/utils/contentUtils'

const route = useRoute()

const slug = (route.params.slug as string[]).join('/')

const basePath = route.path

const { data: surround } = await useAsyncData(`${route.path}-surround`, () => {
  return queryCollectionItemSurroundings('glossar', basePath, {
    fields: ['description'],
  })
})

const { data: page }
  = await
  useAsyncData(
    `glossar-${slug}`,
    () => {
      return queryCollection('glossar').path(basePath).first()
    })

const title = page.value?.title || `Glossar`

await definePageData({
  title: title + ' - Faktenfackel Glossar',
  pageHeading: title,
  pageSubHeading: '',
  description: page.value?.description,
})
const lastChangeStr = page.value?.date as string | null || ''
const lastChange = new Date(lastChangeStr).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
</script>

<template>
  <div>
    <NuxtLink
      to="/"
      style="display: inline-flex;
    vertical-align: middle;"
    >
      <icon
        name="i-lucide:arrow-left"
        style="margin-right: 0.5rem;"
      />
      Zurück zur Startseite
    </NuxtLink>

    <UPage
      v-if="page"
      style="width:fit-content"
    >
      <UPageHeader
        :title="page.title"
        :headline="`Stand: ${lastChange}`"
      />

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
