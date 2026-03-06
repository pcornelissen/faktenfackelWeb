<script setup lang="ts">
import { capitalize } from '~/utils/stringUtils'
import { definePageData, type Post, type Quote } from '~/utils/contentUtils'
import type { Source, SourceLink } from '~/utils/referenceData'

const route = useRoute()
const tag = computed(() => route.params.tag as string)

const undTags = computed(() => {
  const und = route.query.und
  return (Array.isArray(und) ? und : und ? [und] : []) as string[]
})
const activeTags = computed(() => [tag.value, ...undTags.value])

await definePageData({
  title: computed(() => `Schlagwort: ${capitalize(tag.value)} – Faktenfackel`).value,
  pageHeading: '',
})

function likeTag(t: string) {
  return '%"' + t + '"%'
}

const { data: rawFaktenchecks, pending: p1 } = useLazyAsyncData(
  () => route.path + '-fc',
  () => queryCollection('faktenchecks').where('tags', 'LIKE', likeTag(tag.value)).all(),
  { server: false },
)
const { data: rawLagerfeuer, pending: p2 } = useLazyAsyncData(
  () => route.path + '-lf',
  () => queryCollection('lagerfeuer').where('tags', 'LIKE', likeTag(tag.value)).all(),
  { server: false },
)
const { data: rawGlossar, pending: p3 } = useLazyAsyncData(
  () => route.path + '-gl',
  () => queryCollection('glossar').where('tags', 'LIKE', likeTag(tag.value)).all(),
  { server: false },
)
const { data: rawZitate, pending: p4 } = useLazyAsyncData(
  () => route.path + '-zi',
  () => queryCollection('zitate').where('tags', 'LIKE', likeTag(tag.value)).all(),
  { server: false },
)
const { data: rawQuellenlinks, pending: p5 } = useLazyAsyncData(
  () => route.path + '-ql',
  () => queryCollection('quellenlinks').where('tags', 'LIKE', likeTag(tag.value)).order('path', 'ASC').all(),
  { server: false },
)
const { data: rawQuellen, pending: p6 } = useLazyAsyncData(
  () => route.path + '-qu',
  () => queryCollection('quellen').where('tags', 'LIKE', likeTag(tag.value)).order('name', 'ASC').all(),
  { server: false },
)

const anyPending = computed(() =>
  p1.value || p2.value || p3.value || p4.value || p5.value || p6.value,
)

function matchesUndTags(tags: string[] | undefined) {
  if (undTags.value.length === 0) return true
  return undTags.value.every(ut =>
    (tags ?? []).map(t => t.toLowerCase()).includes(ut.toLowerCase()),
  )
}

const filteredFaktenchecks = computed(() =>
  ((rawFaktenchecks.value ?? []) as unknown as Post[]).filter(item => matchesUndTags(item.tags)),
)
const filteredLagerfeuer = computed(() =>
  ((rawLagerfeuer.value ?? []) as unknown as Post[]).filter(item => matchesUndTags(item.tags)),
)
const filteredGlossar = computed(() =>
  ((rawGlossar.value ?? []) as unknown as Post[]).filter(item => matchesUndTags(item.tags)),
)
const filteredZitate = computed(() =>
  ((rawZitate.value ?? []) as unknown as Quote[]).filter(item => matchesUndTags(item.tags)),
)
const filteredQuellenlinks = computed(() =>
  ((rawQuellenlinks.value ?? []) as unknown as SourceLink[]).filter(item => matchesUndTags(item.tags)),
)
const filteredQuellen = computed(() =>
  ((rawQuellen.value ?? []) as unknown as Source[]).filter(item => matchesUndTags(item.tags)),
)

// Eltern-Quellen für gematchte Quellenlinks nachladen (falls die Quelle selbst kein Tag-Match hat)
const parentQuellenCache = ref<Source[]>([])
watch(filteredQuellenlinks, async (links) => {
  const paths = [...new Set(links.map(l => l.path.split('/').slice(0, 4).join('/')))]
  if (paths.length === 0) {
    parentQuellenCache.value = []
    return
  }
  const results = await queryCollection('quellen').where('path', 'IN', paths).all()
  parentQuellenCache.value = results as unknown as Source[]
}, { immediate: true })

// Quellen + Quellenlinks gruppiert
const sourcesGrouped = computed(() => {
  const map = new Map<string, { source: Source, links: SourceLink[], tagMatch: boolean }>()
  for (const source of filteredQuellen.value)
    map.set(source.path, { source, links: [], tagMatch: true })
  for (const source of parentQuellenCache.value)
    if (!map.has(source.path))
      map.set(source.path, { source, links: [], tagMatch: false })
  for (const link of filteredQuellenlinks.value) {
    const parentPath = link.path.split('/').slice(0, 4).join('/')
    const entry = map.get(parentPath)
    if (entry) entry.links.push(link)
  }
  return [...map.values()].sort((a, b) => a.source.name.localeCompare(b.source.name))
})

const totalResults = computed(() =>
  filteredFaktenchecks.value.length
  + filteredLagerfeuer.value.length
  + filteredGlossar.value.length
  + filteredZitate.value.length
  + sourcesGrouped.value.length,
)

const hasResults = computed(() => totalResults.value > 0)

// Related tags: all tags from filtered results with freq > 1, not already active
const relatedTags = computed(() => {
  const activeNorm = activeTags.value.map(t => t.toLowerCase())
  const freq = new Map<string, number>()
  const allFiltered = [
    ...filteredFaktenchecks.value,
    ...filteredLagerfeuer.value,
    ...filteredGlossar.value,
    ...filteredZitate.value,
    ...filteredQuellenlinks.value,
    ...filteredQuellen.value,
  ]
  for (const item of allFiltered) {
    for (const t of (item.tags ?? [])) {
      if (!activeNorm.includes(t.toLowerCase())) {
        freq.set(t, (freq.get(t) || 0) + 1)
      }
    }
  }
  return [...freq.entries()].filter(([, count]) => count > 1).sort((a, b) => b[1] - a[1])
})

function addTag(newTag: string) {
  navigateTo({
    params: { tag: tag.value },
    query: { und: [...undTags.value, newTag] },
  })
}

function removeTag(tagToRemove: string) {
  const remaining = activeTags.value.filter(t => t.toLowerCase() !== tagToRemove.toLowerCase())
  if (remaining.length === 0) {
    navigateTo('/tags')
  } else {
    navigateTo({
      params: { tag: remaining[0] },
      query: remaining.length > 1 ? { und: remaining.slice(1) } : {},
    })
  }
}
</script>

<template>
  <div>
    <NuxtLink
      to="/tags"
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
      <div class="active-tags">
        <button
          v-for="at in activeTags"
          :key="at"
          class="active-tag"
          @click="removeTag(at)"
        >
          {{ capitalize(at) }}
          <Icon
            name="i-lucide:x"
            class="active-tag-x"
          />
        </button>
      </div>
      <p
        v-if="!anyPending && hasResults"
        class="page-meta"
      >
        {{ totalResults }} Treffer
      </p>
    </div>

    <div
      v-if="!anyPending && relatedTags.length > 0 && activeTags.length < 5"
      class="related-tags"
    >
      <span class="related-label">Eingrenzen:</span>
      <button
        v-for="[rt, rtCount] in relatedTags"
        :key="rt"
        class="related-tag"
        @click="addTag(rt)"
      >
        <Icon
          name="i-lucide:plus"
          class="related-tag-icon"
        />
        {{ capitalize(rt) }}
        <span class="related-tag-count">{{ rtCount }}</span>
      </button>
    </div>

    <div
      v-if="anyPending"
      class="loading"
    >
      <span class="loading-text">Inhalte werden geladen…</span>
    </div>

    <div
      v-else-if="hasResults"
      class="results-layout"
    >
      <ContentSection
        v-if="filteredFaktenchecks.length > 0"
        icon="i-lucide:check-circle"
        title="Faktenchecks"
      >
        <PostsList :list="filteredFaktenchecks" />
      </ContentSection>

      <ContentSection
        v-if="filteredLagerfeuer.length > 0"
        icon="i-lucide:flame"
        title="Lagerfeuer"
      >
        <PostsList :list="filteredLagerfeuer" />
      </ContentSection>

      <ContentSection
        v-if="filteredGlossar.length > 0"
        icon="i-lucide:book-open"
        title="Glossar"
      >
        <PostsList :list="filteredGlossar" />
      </ContentSection>

      <ContentSection
        v-if="filteredZitate.length > 0"
        icon="i-lucide:quote"
        title="Zitate"
      >
        <QuotesList
          :list="filteredZitate"
          :show-source="true"
        />
      </ContentSection>

      <ContentSection
        v-if="sourcesGrouped.length > 0"
        icon="i-lucide:building-2"
        title="Quellen"
      >
        <SourceLinkGroups :entries="sourcesGrouped" />
      </ContentSection>
    </div>

    <div
      v-else
      class="empty-state"
    >
      <Icon
        name="i-lucide:search-x"
        class="empty-icon"
      />
      <p>Keine Inhalte mit dem Schlagwort „{{ capitalize(tag) }}" gefunden.</p>
      <NuxtLink
        to="/tags"
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
  margin-bottom: 1.5rem;
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
  margin: 0 0 0.75rem;
  color: var(--ink);
}

.active-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}

.active-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  font-weight: 500;
  background: var(--flame);
  color: white;
  border: none;
  padding: 0.25rem 0.6rem;
  border-radius: 0.2rem;
  cursor: pointer;
  transition: background 0.15s;
}

.active-tag:hover {
  background: var(--ember);
}

.active-tag-x {
  font-size: 0.75rem;
  opacity: 0.8;
}

.page-meta {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.78rem;
  color: var(--muted);
  margin: 0;
}

.related-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 1.5rem;
  padding: 0.6rem 0.75rem;
  background: var(--paper);
  border: 1px solid var(--fackel-border);
  border-radius: 4px;
}

.related-label {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.72rem;
  color: var(--muted);
  margin-right: 0.2rem;
}

.related-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: var(--muted);
  background: white;
  border: 1px solid var(--fackel-border);
  padding: 0.2rem 0.5rem;
  border-radius: 0.2rem;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}

.related-tag:hover {
  border-color: var(--flame);
  color: var(--flame);
}

.related-tag-icon {
  font-size: 0.7rem;
  opacity: 0.6;
}

.related-tag-count {
  font-size: 0.7rem;
  opacity: 0.6;
  margin-left: 0.2rem;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: var(--muted);
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.82rem;
}

.results-layout {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
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
