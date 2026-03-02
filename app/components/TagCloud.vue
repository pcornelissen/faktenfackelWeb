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

// Schriftgröße: 0.78rem (selten) bis 1.6rem (häufig)
function getFontSize(count: number): string {
  const range = maxCount.value - minCount.value
  if (range === 0) return '1rem'
  const ratio = (count - minCount.value) / range
  const size = 0.78 + ratio * 0.9
  return `${size.toFixed(2)}rem`
}

// Gewicht: 300 (selten) bis 700 (häufig)
function getFontWeight(count: number): number {
  const range = maxCount.value - minCount.value
  if (range === 0) return 400
  const ratio = (count - minCount.value) / range
  if (ratio > 0.66) return 700
  if (ratio > 0.33) return 500
  return 300
}

// Farbintensität über opacity auf --flame
function getOpacity(count: number): number {
  const range = maxCount.value - minCount.value
  if (range === 0) return 0.8
  const ratio = (count - minCount.value) / range
  return 0.35 + ratio * 0.65
}

// Kleine zufällig-wirkende Rotation basierend auf Tag-String
function getRotation(tag: string): string {
  const sum = tag.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const deg = ((sum % 7) - 3) * 0.8
  return `${deg.toFixed(1)}deg`
}

const avgCount = computed(() =>
  totalCount.value / props.tagMap.size,
)
</script>

<template>
  <div class="tag-cloud">
    <NuxtLink
      v-for="tag in tagKeys"
      :key="tag"
      :to="`${basePath}/${tag}`"
      class="tag-item"
      :class="{
        'tag-hot': (tagMap.get(tag) || 0) >= avgCount * 2,
        'tag-warm': (tagMap.get(tag) || 0) >= avgCount && (tagMap.get(tag) || 0) < avgCount * 2,
        'tag-cool': (tagMap.get(tag) || 0) < avgCount,
      }"
      :style="{
        fontSize: getFontSize(tagMap.get(tag) || 0),
        fontWeight: getFontWeight(tagMap.get(tag) || 0),
        '--tag-opacity': getOpacity(tagMap.get(tag) || 0),
        '--tag-rotate': getRotation(tag),
      }"
    >
      <span class="tag-text">{{ capitalize(tag) }}</span>
      <span class="tag-count">{{ tagMap.get(tag) }}</span>
    </NuxtLink>
  </div>
</template>

<style scoped>
.tag-cloud {
  --tag-rotate: 0deg;
  --tag-opacity: 0.5;

  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 0.6rem;
  align-items: center;
  padding: 1.5rem 0;
  line-height: 1;
}

.tag-item {
  display: inline-flex;
  align-items: baseline;
  gap: 0.25em;
  text-decoration: none;
  font-family: 'Source Serif 4', Georgia, serif;
  color: var(--ink);
  padding: 0.2em 0.5em;
  border-radius: 3px;
  transition: all 0.15s ease;
  position: relative;
  transform: rotate(var(--tag-rotate));
  white-space: nowrap;
}

/* Farbkodierung über Pseudo-Element */
.tag-item::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 3px;
  background: var(--flame);
  opacity: calc(var(--tag-opacity) * 0.12);
  transition: opacity 0.15s;
}

.tag-item:hover {
  color: var(--flame);
  transform: rotate(0deg) translateY(-1px);
}

.tag-item:hover::before {
  opacity: calc(var(--tag-opacity) * 0.22);
}

/* Heiße Tags (sehr häufig): mit Unterstriche in Flame-Farbe */
.tag-hot .tag-text {
  border-bottom: 2px solid var(--flame);
  padding-bottom: 1px;
}

/* Zählbadge */
.tag-count {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.6em;
  color: var(--muted);
  opacity: 0.7;
  font-weight: 400;
}

.tag-item:hover .tag-count {
  opacity: 1;
  color: var(--flame);
}
</style>
