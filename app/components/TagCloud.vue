<script setup lang="ts">
import { capitalize } from '~/utils/stringUtils'

const props = defineProps<{
  tagMap: Map<string, number>
  basePath: string
}>()

const tagKeys = computed(() => [...props.tagMap.keys()].sort())
const maxCount = computed(() => Math.max(...props.tagMap.values()))
const minCount = computed(() => Math.min(...props.tagMap.values()))
const totalCount = computed(() => [...props.tagMap.values()].reduce((a, b) => a + b, 0))
const avgCount = computed(() => totalCount.value / props.tagMap.size)

// Schriftgröße: 0.78rem (selten) bis 1.4rem (häufig)
function getFontSize(count: number): string {
  const range = maxCount.value - minCount.value
  if (range === 0) return '0.78rem'
  const ratio = (count - minCount.value) / range
  return `${(0.78 + ratio * 0.62).toFixed(2)}rem`
}

// Gewicht: 400 (selten) bis 700 (häufig)
function getFontWeight(count: number): number {
  const range = maxCount.value - minCount.value
  if (range === 0) return 400
  const ratio = (count - minCount.value) / range
  if (ratio > 0.66) return 700
  if (ratio > 0.33) return 500
  return 400
}

// Subtile Rotation basierend auf Tag-String (deterministisch)
function getRotation(tag: string): string {
  const sum = tag.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const deg = ((sum % 7) - 3) * 0.8
  return `${deg.toFixed(1)}deg`
}
</script>

<template>
  <div class="tag-cloud">
    <NuxtLink
      v-for="tag in tagKeys"
      :key="tag"
      :to="`${basePath}/${tag}`"
      class="tag"
      :class="{ 'tag-hot': (tagMap.get(tag) || 0) >= avgCount * 2 }"
      :style="{
        'fontSize': getFontSize(tagMap.get(tag) || 0),
        'fontWeight': getFontWeight(tagMap.get(tag) || 0),
        '--tag-rotate': getRotation(tag),
      }"
    >
      {{ capitalize(tag) }}
      <span class="tag-count">{{ tagMap.get(tag) }}</span>
    </NuxtLink>
  </div>
</template>

<style scoped>
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
  border-radius: 4px;
  margin-top: 1.5rem;
}

/* Gleicher Stil wie sources/Tag.vue */
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
  background-color: white;
  transform: rotate(0deg) translateY(-1px);
}

/* Sehr häufige Tags: Flame-Border als Hinweis */
.tag-hot {
  border-color: color-mix(in srgb, var(--flame) 40%, var(--fackel-border));
}

.tag-count {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.65em;
  opacity: 0.55;
}
</style>
