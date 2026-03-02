<script setup lang="ts">
import { definePageData } from '~/utils/contentUtils'

const route = useRoute()

await definePageData({
  title: 'Quellen – Schlagwörter',
  pageHeading: '',
})

const { data: list } = await useAsyncData(route.path, () =>
  queryCollection('quellenlinks').select('tags').all(),
)

const tagMap = (list.value ?? [])
  .map(t => [...(t.tags ?? [])])
  .flat()
  .reduce((r, a) => {
    r.set(a, (r.get(a) || 0) + 1)
    return r
  }, new Map<string, number>())
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">
        Schlagwörter
      </h1>
      <p class="page-desc">
        Alle Schlagwörter der Quellenlinks. Größe und Intensität zeigen die Häufigkeit.
      </p>
    </div>
    <TagCloud
      :tag-map="tagMap"
      base-path="/quellen/tags"
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
