<script setup lang="ts">
import { capitalize } from '~/utils/stringUtils'
import { definePageData } from '~/utils/contentUtils'

const route = useRoute()
const tag = route.params.tag as string

const { data: tagInfo } = await useAsyncData(
  `zitate-${tag}-info`,
  () => queryCollection('zitate').path(`/zitate/tags/${tag.toLowerCase()}/_info`).first(),
)

await definePageData({
  title: `Schlagwort: ${capitalize(tag)} – Zitate`,
  pageHeading: '',
})

const { data: list1 } = await useAsyncData(route.path, () =>
  queryCollection('zitate').all(),
)
const list = list1.value as Quote[]

const filtered = computed(() =>
  (list ?? []).filter(item =>
    item.tags.map((t: string) => t.toLowerCase()).includes(tag.toLowerCase()),
  ),
)
</script>

<template>
  <div>
    <NuxtLink
      to="/zitate/tags"
      class="back-link"
    >
      <Icon
        name="i-lucide:arrow-left"
        style="margin-right: 0.4rem;"
      />
      Alle Schlagwörter
    </NuxtLink>

    <div class="page-header">
      <div class="page-eyebrow">
        Schlagwort
      </div>
      <h1 class="page-title">
        {{ capitalize(tag) }}
      </h1>
      <p class="page-meta">
        {{ filtered.length }} Zitat{{ filtered.length !== 1 ? 'e' : '' }}
      </p>
    </div>

    <div
      v-if="tagInfo"
      class="intro content"
    >
      <ContentRenderer :value="tagInfo" />
    </div>

    <QuotesList
      v-if="filtered.length > 0"
      :list="filtered"
      :show-source="true"
    />
    <div
      v-else
      class="empty-state"
    >
      <Icon
        name="i-lucide:search-x"
        class="empty-icon"
      />
      <p>Keine Zitate mit dem Schlagwort „{{ tag }}" gefunden.</p>
      <NuxtLink
        to="/zitate/tags"
        class="back-link"
      >
        Zurück zur Übersicht
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.back-link {
  display: inline-flex;
  align-items: center;
  font-size: 0.88rem;
  color: var(--muted);
  text-decoration: none;
  transition: color 0.15s;
  margin-bottom: 1.5rem;
}

.back-link:hover {
  color: var(--flame);
}

.page-header {
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--fackel-border);
  margin-bottom: 2rem;
}

.page-eyebrow {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--flame);
  margin-bottom: 0.3rem;
}

.page-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 2rem;
  font-weight: 900;
  margin: 0 0 0.4rem;
  color: var(--ink);
}

.page-meta {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.78rem;
  color: var(--muted);
  margin: 0;
}

.intro {
  margin-bottom: 2rem;
  padding: 1rem 1.25rem;
  background: white;
  border: 1px solid var(--fackel-border);
  border-left: 3px solid var(--flame);
  border-radius: 0 4px 4px 0;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--muted);
}

.empty-icon {
  font-size: 2.5rem;
  color: var(--fackel-border);
  margin-bottom: 1rem;
}
</style>
