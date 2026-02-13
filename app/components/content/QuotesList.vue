<script setup lang="ts">
import type { Quote } from '~/utils/contentUtils'
import QuoteListItem from '~/components/content/QuoteListItem.vue'
import { useAsyncData } from '#app'
import SourceShortInfo from '~/components/sources/SourceShortInfo.vue'

const props = defineProps<{
  list: Quote[]
  showSource?: boolean | null
}>()

const sourcesRaw
  = (props.showSource === true && props.list.length > 0
    ? (await useAsyncData('fetch-quote-sources', () => {
        const builder = queryCollection('quellen').orWhere(
          (query) => {
            new Set(props.list.map(i => buildSourcePath(i.path))).forEach(s => query = query.where('path', '=', s))
            return query
          },
        )
        return builder
          .all()
      }))?.data?.value
    : null) || []
const sources = new Map<string, Source>()
sourcesRaw.forEach(s => sources.set(buildSourcePath(s.path), s))
</script>

<template>
  <nav class="navigation">
    <ul>
      <QuoteListItem
        v-for="item in props.list"
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
  </nav>
</template>

<style scoped>
</style>
