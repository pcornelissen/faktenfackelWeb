<script setup lang="ts">
import { capitalize } from '~/utils/stringUtils'
import { definePageData, type Post, type Quote } from '~/utils/contentUtils'
import type { Source, SourceLink } from '~/utils/referenceData'
import { type GraphNode, nodeToHref, nodeToSourceLink } from '~/utils/graphData'

definePageMeta({
  sitemap: false,
})

useSeoMeta({
  robots: 'noindex, follow',
})

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
  description: computed(() => `Alle Faktenchecks, Artikel, Glossareinträge und Quellen zum Schlagwort „${capitalize(tag.value)}" auf Faktenfackel.`).value,
})

const { data: graphData, pending } = useLazyFetch<{ results: GraphNode[] }>(
  () => `/api/graph/tags/${encodeURIComponent(tag.value)}`,
  { key: () => `tag-${tag.value}`, default: () => ({ results: [] }), server: false },
)

const anyPending = computed(() => pending.value)

function matchesUndTags(tags: string[] | undefined) {
  if (undTags.value.length === 0) return true
  return undTags.value.every(ut =>
    (tags ?? []).map(t => t.toLowerCase()).includes(ut.toLowerCase()),
  )
}

const allNodes = computed(() =>
  (graphData.value?.results ?? []).filter(n => matchesUndTags(n.tags)),
)

function nodeToPost(n: GraphNode): Post {
  return {
    title: n.name ?? '',
    subtitle: n.summary ?? '',
    path: nodeToHref(n),
    date: n.date ?? '',
    tags: n.tags ?? [],
    verdict: (n.verdict ?? undefined) as Post['verdict'],
  } as unknown as Post
}

function nodeToQuote(n: GraphNode): Quote {
  return {
    title: n.name ?? '',
    teaser: n.summary ?? '',
    path: nodeToHref(n),
    date: n.date ?? '',
    tags: n.tags ?? [],
    code: n.id,
    publishedOn: n.date ?? '',
  }
}

const filteredFaktenchecks = computed(() =>
  allNodes.value.filter(n => n.type === 'article' && n.group_ === 'faktenchecks').map(nodeToPost),
)
const filteredLagerfeuer = computed(() =>
  allNodes.value.filter(n => n.type === 'article' && n.group_ === 'lagerfeuer').map(nodeToPost),
)
const filteredGlossar = computed(() =>
  allNodes.value.filter(n => n.type === 'article' && n.group_ === 'glossar').map(nodeToPost),
)
const filteredZitate = computed(() =>
  allNodes.value.filter(n => n.type === 'quote').map(nodeToQuote),
)
const filteredQuellenlinks = computed(() =>
  allNodes.value.filter(n => n.type === 'link').map(n => nodeToSourceLink(n) as unknown as SourceLink),
)
const filteredQuellen = computed<Source[]>(() =>
  allNodes.value.filter(n => n.type === 'source').map(n => ({
    name: n.name ?? '',
    path: n.path ?? '',
    tags: n.tags ?? [],
    description: n.summary ?? '',
  }) as unknown as Source),
)

// Quellen + Quellenlinks gruppiert. Parent-Quellen der Links kommen aus dem Endpoint mit.
const sourcesGrouped = computed(() => {
  const map = new Map<string, { source: Source, links: SourceLink[], tagMatch: boolean }>()
  for (const source of filteredQuellen.value)
    map.set(source.path, { source, links: [], tagMatch: true })
  for (const linkNode of allNodes.value.filter(n => n.type === 'link')) {
    const parentPath = linkNode.parent_path ?? null
    if (!parentPath) continue
    if (!map.has(parentPath)) {
      map.set(parentPath, {
        source: {
          name: linkNode.parent_name ?? '',
          path: parentPath,
          tags: [],
        } as unknown as Source,
        links: [],
        tagMatch: false,
      })
    }
    map.get(parentPath)!.links.push(nodeToSourceLink(linkNode) as unknown as SourceLink)
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

const totalSourceLinks = computed(() =>
  sourcesGrouped.value.reduce((sum, entry) => sum + entry.links.length, 0),
)

const resultSummary = computed(() => {
  const parts: string[] = []
  const fc = filteredFaktenchecks.value.length
  const lf = filteredLagerfeuer.value.length
  const gl = filteredGlossar.value.length
  const zi = filteredZitate.value.length
  const qu = sourcesGrouped.value.length
  const ql = totalSourceLinks.value
  if (fc > 0) parts.push(`${fc} Faktencheck${fc !== 1 ? 's' : ''}`)
  if (lf > 0) parts.push(`${lf} Lagerfeuer-Beitrag${lf !== 1 ? 'e' : ''}`)
  if (gl > 0) parts.push(`${gl} Glossar-Eintrag${gl !== 1 ? 'e' : ''}`)
  if (zi > 0) parts.push(`${zi} Zitat${zi !== 1 ? 'e' : ''}`)
  if (qu > 0) {
    const linkPart = ql > 0 ? ` mit insg. ${ql} Link${ql !== 1 ? 's' : ''}` : ''
    parts.push(`${qu} Quelle${qu !== 1 ? 'n' : ''}${linkPart}`)
  }
  return parts.join(' · ')
})

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
        {{ resultSummary }}
      </p>
    </div>

    <div
      v-if="!anyPending && relatedTags.length > 0 && activeTags.length < 5"
      class="related-tags"
    >
      <span class="related-label">Filtern:</span>
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
