<script setup lang="ts">
import QuoteListItem from '~/components/content/QuoteListItem.vue'
import TagFilteredPager from '~/components/content/TagFilteredPager.vue'
import { nodeToHref } from '~/utils/graphData'
import type { Quote } from '~/utils/contentUtils'

const props = defineProps<{
  tags: string[] | string
  sort?: 'date_desc' | 'date_asc'
  limit?: number
  instanceKey?: string
}>()

const tagList = computed(() =>
  (Array.isArray(props.tags)
    ? props.tags
    : typeof props.tags === 'string' ? JSON.parse(props.tags) as string[] : [])
    .map(t => String(t)).filter(Boolean),
)

const { items, page, totalPages, pageParam, isEmpty, pending } = useTagFilteredNodes({
  type: 'quote',
  tags: () => tagList.value,
  sort: props.sort,
  limit: props.limit,
  instanceKey: props.instanceKey,
})

const quotes = computed<Quote[]>(() =>
  items.value.map(n => ({
    title: n.name ?? '',
    teaser: n.summary ?? '',
    path: nodeToHref(n),
    date: n.date ?? '',
    tags: n.tags ?? [],
    code: n.id,
    publishedOn: n.date ?? '',
  } as unknown as Quote)),
)
</script>

<template>
  <div class="tf-wrap">
    <div
      v-if="pending && !quotes.length"
      class="tf-loading"
    >
      Lade Einträge …
    </div>
    <p
      v-else-if="isEmpty"
      class="tf-empty"
    >
      Noch keine Einträge zu diesem Thema.
    </p>
    <ul
      v-else
      class="tf-list"
    >
      <QuoteListItem
        v-for="q in quotes"
        :key="q.code"
        :quote="q"
      />
    </ul>
    <TagFilteredPager
      :page="page"
      :total-pages="totalPages"
      :query-key="pageParam"
    />
  </div>
</template>

<style scoped>
.tf-wrap {
  margin: 1.25rem 0;
}
.tf-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.tf-empty {
  color: var(--muted);
  font-style: italic;
  padding: 0.75rem 0;
}
.tf-loading {
  color: var(--muted);
  padding: 0.75rem 0;
}
</style>
