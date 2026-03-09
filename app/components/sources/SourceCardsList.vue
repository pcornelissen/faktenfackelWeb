<script setup lang="ts">
import type { Source } from '~/utils/referenceData'

const props = defineProps<{
  list: Source[]
  pageSize?: number
}>()

const { currentPage, totalPages, pageItems, goTo } = usePagination(() => props.list, props.pageSize ?? 24)
</script>

<template>
  <nav class="navigation">
    <div class="pager-top-wrap">
      <PagerNav
        :current-page="currentPage"
        :total-pages="totalPages"
        @go="goTo"
      />
    </div>
    <ul
      class="flex flex-wrap "
      style="max-width: 100%"
    >
      <LazySourceCard
        v-for="item in pageItems"
        :key="item.path"
        :source="item"
      />
    </ul>
    <PagerNav
      :current-page="currentPage"
      :total-pages="totalPages"
      @go="goTo"
    />
  </nav>
</template>

<style scoped>
.pager-top-wrap :deep(.pager) {
  margin-top: 0;
  margin-bottom: 1rem;
}

li {
  font-size: 1rem;
  margin-bottom: 1rem;
  list-style: none;
  border-radius: 0.3rem;
  padding: 0.5rem;
}
</style>
