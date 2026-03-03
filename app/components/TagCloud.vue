<script setup lang="ts">
import { capitalize } from '~/utils/stringUtils'

const props = defineProps<{
  tagMap: Map<string, number>
  basePath: string
}>()

const filter = ref('')

const filteredKeys = computed(() => {
  const query = filter.value.trim().toLowerCase()
  return [...props.tagMap.keys()]
    .filter(tag => !query || tag.toLowerCase().includes(query))
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase(), 'de'))
})

const maxCount = computed(() => Math.max(...props.tagMap.values()))
const minCount = computed(() => Math.min(...props.tagMap.values()))
const totalCount = computed(() => [...props.tagMap.values()].reduce((a, b) => a + b, 0))
const avgCount = computed(() => totalCount.value / props.tagMap.size)

function getFontSize(count: number): string {
  const range = maxCount.value - minCount.value
  if (range === 0) return '0.78rem'
  const ratio = (count - minCount.value) / range
  return `${(0.78 + ratio * 0.62).toFixed(2)}rem`
}

function getFontWeight(count: number): number {
  const range = maxCount.value - minCount.value
  if (range === 0) return 400
  const ratio = (count - minCount.value) / range
  if (ratio > 0.66) return 700
  if (ratio > 0.33) return 500
  return 400
}

function getBackground(count: number): string {
  const range = maxCount.value - minCount.value
  if (range === 0) return 'white'
  const ratio = (count - minCount.value) / range
  return `color-mix(in srgb, var(--flame) ${(ratio * 28).toFixed(0)}%, white)`
}

function getRotation(tag: string): string {
  const sum = tag.split('').reduce((a, c) => a + (c.codePointAt(0) ?? 0), 0)
  const deg = ((sum % 7) - 3) * 0.8
  return `${deg.toFixed(1)}deg`
}
</script>

<template>
  <div class="tag-cloud-wrapper">
    <div class="tag-cloud-header">
      <span class="tag-cloud-count">
        {{ filteredKeys.length }} von {{ tagMap.size }} Schlagwörtern
      </span>
      <div class="tag-filter-wrap">
        <Icon
          name="i-lucide:search"
          class="filter-icon"
        />
        <input
          v-model="filter"
          type="search"
          placeholder="Filtern …"
          class="tag-filter"
        >
      </div>
    </div>

    <div class="tag-cloud">
      <template v-if="filteredKeys.length > 0">
        <NuxtLink
          v-for="tag in filteredKeys"
          :key="tag"
          :to="`${basePath}/${tag}`"
          class="tag"
          :class="{ 'tag-hot': (tagMap.get(tag) || 0) >= avgCount * 2 }"
          :style="{
            'fontSize': getFontSize(tagMap.get(tag) || 0),
            'fontWeight': getFontWeight(tagMap.get(tag) || 0),
            'backgroundColor': getBackground(tagMap.get(tag) || 0),
            '--tag-rotate': filter ? '0deg' : getRotation(tag),
          }"
        >
          {{ capitalize(tag) }}
          <span class="tag-count">{{ tagMap.get(tag) }}</span>
        </NuxtLink>
      </template>
      <span
        v-else
        class="tag-empty"
      >
        Keine Schlagwörter gefunden für „{{ filter }}"
      </span>
    </div>
  </div>
</template>

<style scoped>
.tag-cloud-wrapper {
  margin-top: 1.5rem;
}

.tag-cloud-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0;
  padding: 0.6rem 1rem;
  background: var(--fackel-border);
  border: 1px solid var(--fackel-border);
  border-bottom: none;
  border-radius: 4px 4px 0 0;
}

.tag-cloud-count {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.72rem;
  color: var(--muted);
  letter-spacing: 0.04em;
}

.tag-filter-wrap {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: white;
  border: 1px solid var(--fackel-border);
  border-radius: 0.2rem;
  padding: 0.2rem 0.5rem;
  transition: border-color 0.15s;
}

.tag-filter-wrap:focus-within {
  border-color: var(--flame);
}

.filter-icon {
  color: var(--muted);
  font-size: 0.8rem;
  flex-shrink: 0;
}

.tag-filter {
  font-family: 'Source Serif 4', serif;
  font-size: 0.82rem;
  color: var(--ink);
  background: none;
  border: none;
  outline: none;
  width: 10rem;
}

.tag-filter::placeholder {
  color: var(--muted);
  opacity: 0.6;
}

/* Suchfeld-X-Button verstecken (Browser-Default) */
.tag-filter::-webkit-search-cancel-button {
  -webkit-appearance: none;
}

.tag-cloud {
  --tag-rotate: 0deg;

  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 0.1rem;
  align-items: center;
  padding: 1.25rem;
  background: var(--paper);
  border: 1px solid var(--fackel-border);
  border-top: 2px solid var(--flame);
  border-radius: 0 0 4px 4px;
  min-height: 4rem;
}

.tag {
  display: inline-flex;
  align-items: baseline;
  gap: 0.3em;
  font-weight: 500;
  background-color: white;
  color: var(--muted);
  border: 1px solid var(--fackel-border);
  padding: 0.2rem 0.5rem;
  margin: 0.15rem 0.2rem;
  border-radius: 0.2rem;
  text-decoration: none;
  transition: border-color 0.15s, color 0.15s, transform 0.15s;
  transform: rotate(var(--tag-rotate));
  white-space: nowrap;
}

.tag:hover {
  border-color: var(--flame);
  color: var(--flame);
  transform: rotate(0deg) translateY(-1px);
}

.tag-hot {
  border-color: color-mix(in srgb, var(--flame) 40%, var(--fackel-border));
}

.tag-count {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.65em;
  opacity: 0.55;
}

.tag-empty {
  font-size: 0.88rem;
  color: var(--muted);
  font-style: italic;
}
</style>
