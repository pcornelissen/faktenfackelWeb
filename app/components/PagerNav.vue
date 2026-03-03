<script setup lang="ts">
const props = defineProps<{
  currentPage: number
  totalPages: number
}>()

const emit = defineEmits<{
  (e: 'go', page: number): void
}>()

// Returns page numbers and null for ellipsis gaps
const visiblePages = computed<(number | null)[]>(() => {
  const total = props.totalPages
  const current = props.currentPage
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const result: (number | null)[] = [1]
  if (current > 3) result.push(null)
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    result.push(i)
  }
  if (current < total - 2) result.push(null)
  result.push(total)
  return result
})
</script>

<template>
  <nav
    v-if="totalPages > 1"
    class="pager"
    aria-label="Seitennavigation"
  >
    <button
      class="pager-btn"
      :disabled="currentPage === 1"
      aria-label="Vorherige Seite"
      @click="emit('go', currentPage - 1)"
    >
      <span
        class="pager-arrow pager-arrow--left"
        aria-hidden="true"
      />
    </button>

    <template
      v-for="(page, i) in visiblePages"
      :key="i"
    >
      <span
        v-if="page === null"
        class="pager-ellipsis"
        aria-hidden="true"
      >…</span>
      <button
        v-else
        class="pager-btn pager-num"
        :class="{ 'pager-num--active': page === currentPage }"
        :aria-label="`Seite ${page}`"
        :aria-current="page === currentPage ? 'page' : undefined"
        @click="emit('go', page)"
      >
        {{ page }}
      </button>
    </template>

    <button
      class="pager-btn"
      :disabled="currentPage === totalPages"
      aria-label="Nächste Seite"
      @click="emit('go', currentPage + 1)"
    >
      <span
        class="pager-arrow pager-arrow--right"
        aria-hidden="true"
      />
    </button>
  </nav>
</template>

<style scoped>
.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 1.75rem;
  font-family: 'Ubuntu Mono', monospace;
}

.pager-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 6px;
  border: 1px solid var(--fackel-border);
  border-radius: 3px;
  background: white;
  color: var(--muted);
  font-family: inherit;
  font-size: 0.78rem;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
  line-height: 1;
}

.pager-btn:hover:not(:disabled) {
  color: var(--flame);
  border-color: var(--flame);
}

.pager-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.pager-num--active {
  background: var(--flame);
  border-color: var(--flame);
  color: white !important;
}

.pager-ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.78rem;
  color: var(--muted);
  user-select: none;
}

.pager-arrow {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-left: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  flex-shrink: 0;
}

.pager-arrow--left {
  transform: rotate(45deg);
}

.pager-arrow--right {
  transform: rotate(-135deg);
}
</style>
