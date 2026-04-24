<script setup lang="ts">
import SourceLinkItem from '~/components/sources/SourceLinkItem.vue'
import TagFilteredPager from '~/components/content/TagFilteredPager.vue'
import { nodeToSourceLink } from '~/utils/graphData'
import type { SourceLink } from '~/utils/referenceData'

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
  type: 'link',
  tags: () => tagList.value,
  sort: props.sort,
  limit: props.limit,
  instanceKey: props.instanceKey,
})

const sourceLinks = computed<SourceLink[]>(() =>
  items.value.map(n => nodeToSourceLink(n) as unknown as SourceLink),
)
</script>

<template>
  <div class="tf-wrap">
    <div
      v-if="pending && !sourceLinks.length"
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
      <li
        v-for="item in sourceLinks"
        :key="item.path"
        class="flex flex-row"
      >
        <SourceLinkItem
          :item="item"
          :hide-details="false"
        />
      </li>
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
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
