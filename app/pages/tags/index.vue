<script setup lang="ts">
import { definePageData } from '~/utils/contentUtils'

await definePageData({
  title: 'Schlagwörter – Faktenfackel',
  pageHeading: '',
  description: 'Alle Schlagwörter aus Faktenchecks, Lagerfeuer-Artikeln, Glossar und Quellen – durchsuche Inhalte von Faktenfackel nach Themen.',
})

const { data } = await useAsyncData('tags-index', () =>
  Promise.all([
    queryCollection('faktenchecks').select('tags').all(),
    queryCollection('lagerfeuer').select('tags').all(),
    queryCollection('glossar').select('tags').all(),
    queryCollection('zitate').select('tags').all(),
    queryCollection('quellenlinks').select('tags').all(),
    queryCollection('quellen').select('tags').all(),
  ]),
)

// Meta-Tags: interne Verwaltungstags, die nicht im öffentlichen Tag-Cloud erscheinen sollen
const META_TAGS = new Set(['more-research-needed'])

const tagMap = computed(() => {
  const map = new Map<string, number>()
  for (const list of data.value ?? []) {
    for (const item of list) {
      for (const t of (item.tags ?? [])) {
        if (!META_TAGS.has(t.toLowerCase())) {
          map.set(t, (map.get(t) || 0) + 1)
        }
      }
    }
  }
  return map
})
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">
        Schlagwörter
      </h1>
      <p class="page-desc">
        Alle Schlagwörter (Tags) aus Faktenchecks, Lagerfeuer, Glossar, Zitaten und Quellen. Größe und Intensität zeigen die Häufigkeit.
      </p>
    </div>
    <TagCloud
      :tag-map="tagMap"
      base-path="/tags"
    />
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 0.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--fackel-border);
}

.page-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 0.4rem;
  color: var(--ink);
}

.page-desc {
  color: var(--muted);
  font-size: 0.9rem;
  margin: 0;
  font-weight: 300;
}
</style>
