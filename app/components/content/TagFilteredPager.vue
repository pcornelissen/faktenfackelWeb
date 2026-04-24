<script setup lang="ts">
import type { LocationQueryRaw } from 'vue-router'

const props = defineProps<{
  page: number
  totalPages: number
  queryKey: string
}>()

const route = useRoute()

function linkTo(target: number) {
  const query: LocationQueryRaw = { ...route.query }
  if (target <= 1) query[props.queryKey] = undefined
  else query[props.queryKey] = String(target)
  return { path: route.path, query }
}
</script>

<template>
  <nav
    v-if="totalPages > 1"
    class="tf-pager"
    aria-label="Seiten"
  >
    <NuxtLink
      v-if="page > 1"
      :to="linkTo(page - 1)"
      class="tf-pager-btn"
      rel="prev"
    >
      &larr; Zurück
    </NuxtLink>
    <span class="tf-pager-info">Seite {{ page }} von {{ totalPages }}</span>
    <NuxtLink
      v-if="page < totalPages"
      :to="linkTo(page + 1)"
      class="tf-pager-btn"
      rel="next"
    >
      Weiter &rarr;
    </NuxtLink>
  </nav>
</template>

<style scoped>
.tf-pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 1.5rem 0 0.5rem;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
}
.tf-pager-btn {
  padding: 0.35rem 0.8rem;
  border: 1px solid var(--fackel-border);
  border-radius: 0.4rem;
  color: var(--ink);
  text-decoration: none;
  background: white;
  transition: border-color 0.15s, color 0.15s;
}
.tf-pager-btn:hover {
  border-color: var(--flame);
  color: var(--flame);
}
.tf-pager-info {
  color: var(--muted);
}
</style>
