<script setup lang="ts">
import { type Author, resolveAuthors } from '~/utils/authors'
import { dateString } from '~/utils/stringUtils'

const props = defineProps<{
  authors?: readonly string[]
  datePublished?: string | Date | null
  dateModified?: string | Date | null
}>()

const resolved = computed<Author[]>(() => resolveAuthors(props.authors))

function toIso(d: string | Date | null | undefined): string {
  if (!d) return ''
  return new Date(d).toISOString().slice(0, 10)
}

const publishedIso = computed(() => toIso(props.datePublished))
const modifiedIso = computed(() => toIso(props.dateModified))
const publishedLabel = computed(() => props.datePublished ? dateString(typeof props.datePublished === 'string' ? props.datePublished : props.datePublished.toISOString()) : '')
const modifiedLabel = computed(() => props.dateModified ? dateString(typeof props.dateModified === 'string' ? props.dateModified : props.dateModified.toISOString()) : '')
const showModified = computed(() => modifiedIso.value && modifiedIso.value !== publishedIso.value)
</script>

<template>
  <div class="byline">
    <span class="byline-by">Von</span>
    <span
      v-for="(author, idx) in resolved"
      :key="author.slug"
      class="byline-author-wrap"
    >
      <NuxtLink
        :to="author.url"
        class="byline-author"
        rel="author"
      >{{ author.name }}</NuxtLink><span
        v-if="idx < resolved.length - 1"
        class="byline-sep"
      >{{ idx === resolved.length - 2 ? ' und ' : ', ' }}</span>
    </span>
    <span
      v-if="publishedLabel"
      class="byline-dot"
    >·</span>
    <time
      v-if="publishedLabel"
      class="byline-date"
      :datetime="publishedIso"
    >Veröffentlicht: {{ publishedLabel }}</time>
    <template v-if="showModified">
      <span class="byline-dot">·</span>
      <time
        class="byline-date"
        :datetime="modifiedIso"
      >Stand: {{ modifiedLabel }}</time>
    </template>
  </div>
</template>

<style scoped>
.byline {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.4rem;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  color: var(--muted);
  margin-top: 0.6rem;
}

.byline-by {
  text-transform: uppercase;
  color: var(--flame);
  letter-spacing: 0.08em;
  font-weight: 600;
}

.byline-author {
  color: var(--ink);
  text-decoration: none;
  font-weight: 600;
  border-bottom: 1px dotted var(--fackel-border);
  transition: color 0.15s, border-color 0.15s;
}

.byline-author:hover {
  color: var(--ember);
  border-bottom-color: var(--ember);
}

.byline-sep {
  color: var(--muted);
}

.byline-dot {
  color: var(--fackel-border);
}

.byline-date {
  color: var(--muted);
}
</style>
