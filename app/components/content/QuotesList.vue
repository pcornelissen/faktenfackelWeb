<script setup lang="ts">
import type { Quote } from '~/utils/contentUtils'
import QuoteListItem from '~/components/content/QuoteListItem.vue'
import { useAsyncData } from '#app'
import SourceShortInfo from '~/components/sources/SourceShortInfo.vue'

const props = defineProps<{
  list: Quote[]
  showSource?: boolean | null
  pageSize?: number
}>()

const { currentPage, totalPages, pageItems, goTo } = usePagination(() => props.list, props.pageSize ?? 10000)

const sourcesRaw
  = (props.showSource === true && props.list.length > 0
    ? (await useAsyncData('fetch-quote-sources', () => {
        const sourcePaths = [...new Set(props.list.map(i => buildSourcePath(i.path)))]
        return queryCollection('quellen').where('path', 'IN', sourcePaths).all()
      }))?.data?.value
    : null) || []
const sources = new Map<string, Source>()
sourcesRaw.forEach(s => sources.set(buildSourcePath(s.path), s))
</script>

<template>
  <nav class="navigation">
    <ul>
      <QuoteListItem
        v-for="item in pageItems"
        :key="item.path"
        :quote="item"
      >
        <template #pre>
          <source-short-info
            v-if="sources.get(buildSourcePath(item.path))"
            :source="sources.get(buildSourcePath(item.path))"
          />
        </template>
      </QuoteListItem>
    </ul>
    <PagerNav
      v-if="totalPages > 1"
      :current-page="currentPage"
      :total-pages="totalPages"
      @go="goTo"
    />
  </nav>
</template>

<style scoped>
</style>
