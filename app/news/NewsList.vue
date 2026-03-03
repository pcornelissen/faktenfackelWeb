<script setup lang="ts">
import { newsSrc } from '~/news/newsSrc'

const props = defineProps<{
  limit?: number
}>()

const allItems = computed(() => {
  const sorted = [...newsSrc].sort((a, b) => b.date.getTime() - a.date.getTime())
  return props.limit ? sorted.slice(0, props.limit) : sorted
})

const { currentPage, totalPages, pageItems, goTo } = usePagination(() => allItems.value, 50)
</script>

<template>
  <div>
    <ul>
      <li
        v-for="item in pageItems"
        :key="item.title"
      >
        <span class="date">{{ dateString(item.date) }}</span>
        <span class="desc">{{ item.title }}</span>
      </li>
    </ul>
    <PagerNav
      :current-page="currentPage"
      :total-pages="totalPages"
      @go="goTo"
    />
  </div>
</template>

<style scoped>
ul {
  list-style: none;
  padding: 0;
  margin: 0;
  border: 1px solid var(--fackel-border);
  border-top: 2px solid var(--flame);
  border-radius: 4px;
  overflow: hidden;
}

li {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 9px 16px;
  border-bottom: 1px solid var(--fackel-border);
  background: white;
}

li:last-child {
  border-bottom: none;
}

.date {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.8rem;
  color: var(--muted);
  white-space: nowrap;
  margin-top: 2px;
  min-width: 72px;
}

.desc {
  font-size: 0.9rem;
  color: var(--ink);
  line-height: 1.4;
}
</style>
