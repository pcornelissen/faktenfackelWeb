<script setup lang="ts">
import { capitalize } from '~/utils/stringUtils'
import { definePageData, type Post, type Quote } from '~/utils/contentUtils'
import { calculateSourceImg, calculateSourceImgAuthor } from '~/pages/quellen/[group]/sources'
import type { Source, SourceLink } from '~/utils/referenceData'
import Tags from '~/components/sources/Tags.vue'

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

// Eltern-Quellen für gematchte Quellenlinks nachladen (falls Quelle selbst kein Tag-Match hat)
const parentQuellenCache = ref<Source[]>([])
watch(filteredQuellenlinks, async (links) => {
  const paths = [...new Set(links.map(l => l.path.split('/').slice(0, 4).join('/')))]
  if (paths.length === 0) {
    parentQuellenCache.value = []
    return
  }
  const results = await queryCollection('quellen').orWhere((query) => {
    paths.forEach((p) => {
      query = query.where('path', '=', p)
    })
    return query
  }).all()
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

const { currentPage: sgPage, totalPages: sgTotalPages, pageItems: sgPageItems, goTo: sgGoTo }
  = usePagination(() => sourcesGrouped.value, 10)

const totalResults = computed(() =>
  filteredFaktenchecks.value.length
  + filteredLagerfeuer.value.length
  + filteredGlossar.value.length
  + filteredZitate.value.length
  + sourcesGrouped.value.length,
)

const hasResults = computed(() => totalResults.value > 0)

// Related tags: top tags from filtered results not already active
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
      <!-- Faktenchecks -->
      <section
        v-if="filteredFaktenchecks.length > 0"
        class="results-section"
      >
        <h2 class="section-title">
          <Icon
            name="i-lucide:check-circle"
            class="section-icon"
          />
          Faktenchecks
        </h2>
        <PostsList
          :list="filteredFaktenchecks"
        />
      </section>

      <!-- Lagerfeuer -->
      <section
        v-if="filteredLagerfeuer.length > 0"
        class="results-section"
      >
        <h2 class="section-title">
          <Icon
            name="i-lucide:flame"
            class="section-icon"
          />
          Lagerfeuer
        </h2>
        <PostsList
          :list="filteredLagerfeuer"
        />
      </section>

      <!-- Glossar -->
      <section
        v-if="filteredGlossar.length > 0"
        class="results-section"
      >
        <h2 class="section-title">
          <Icon
            name="i-lucide:book-open"
            class="section-icon"
          />
          Glossar
        </h2>
        <PostsList
          :list="filteredGlossar"
        />
      </section>

      <!-- Zitate -->
      <section
        v-if="filteredZitate.length > 0"
        class="results-section"
      >
        <h2 class="section-title">
          <Icon
            name="i-lucide:quote"
            class="section-icon"
          />
          Zitate
        </h2>
        <QuotesList
          :list="filteredZitate"
          :show-source="true"
        />
      </section>

      <!-- Quellen & Quellenlinks gruppiert -->
      <section
        v-if="sourcesGrouped.length > 0"
        class="results-section"
      >
        <h2 class="section-title">
          <Icon
            name="i-lucide:building-2"
            class="section-icon"
          />
          Quellen
        </h2>
        <div class="link-groups">
          <div
            v-for="entry in sgPageItems"
            :key="entry.source.path"
            class="link-group"
          >
            <div class="link-group-header">
              <NuxtLink
                :to="entry.source.path"
                class="link-group-img-link"
              >
                <nuxt-img
                  :src="calculateSourceImg(entry.source)"
                  :alt="entry.source.name"
                  :title="calculateSourceImgAuthor(entry.source)"
                  loading="lazy"
                  class="link-group-img"
                />
              </NuxtLink>
              <div class="link-group-info">
                <NuxtLink
                  :to="entry.source.path"
                  class="link-group-name-row"
                >
                  <span class="link-group-name">{{ entry.source.name }}</span>
                  <Icon
                    name="i-lucide:arrow-right"
                    class="link-group-arrow"
                  />
                </NuxtLink>
                <Tags
                  v-if="entry.source.tags?.length"
                  :tags="entry.source.tags"
                  class="link-group-tags"
                />
              </div>
            </div>
            <ul
              v-if="entry.links.length > 0"
              class="link-list"
            >
              <li
                v-for="link in entry.links"
                :key="link.path"
                class="link-item"
              >
                <a
                  :href="link.uri"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="link-title"
                >
                  <Icon
                    name="i-lucide:external-link"
                    class="link-icon"
                  />
                  {{ link.title }}
                </a>
                <Tags
                  v-if="link.tags?.length"
                  :tags="link.tags"
                  class="link-item-tags"
                />
              </li>
            </ul>
          </div>
        </div>
        <PagerNav
          :current-page="sgPage"
          :total-pages="sgTotalPages"
          @go="sgGoTo"
        />
      </section>
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

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ink);
  margin: 0 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--fackel-border);
}

.section-icon {
  color: var(--flame);
  font-size: 1rem;
}

/* Quellen & Quellenlinks gruppiert */
.link-groups {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.link-group {
  border: 1px solid var(--fackel-border);
  border-radius: 4px;
  overflow: hidden;
  background: white;
}

.link-group-header {
  display: flex;
  flex-direction: row;
  background: #FDFAF5;
  border-bottom: 1px solid var(--fackel-border);
}

.link-group-img-link {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1rem;
  border-right: 1px solid var(--fackel-border);
  min-width: 6rem;
  flex-shrink: 0;
  transition: background 0.15s;
}

.link-group-img-link:hover {
  background: #FAF5EC;
}

.link-group-img {
  max-height: 5rem;
  max-width: 6rem;
  width: auto;
  object-fit: contain;
}

.link-group-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.link-group-name-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  text-decoration: none;
  transition: background 0.15s;
}

.link-group-name-row:hover {
  background: #FAF5EC;
}

.link-group-name {
  font-weight: 600;
  font-size: 1.05rem;
  color: var(--ink);
  flex: 1;
}

.link-group-arrow {
  color: var(--fackel-border);
  flex-shrink: 0;
  transition: color 0.15s, transform 0.15s;
}

.link-group-name-row:hover .link-group-arrow {
  color: var(--flame);
  transform: translateX(2px);
}

.link-group-tags {
  padding: 0 1rem 0.2rem calc(1rem - 0.3rem);
}

.link-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.link-item {
  border-bottom: 1px solid var(--fackel-border);
}

.link-item:last-child {
  border-bottom: none;
}

.link-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1rem;
  font-size: 0.88rem;
  color: var(--ink);
  text-decoration: none;
  transition: color 0.15s, background 0.15s;
}

.link-title:hover {
  color: var(--flame);
  background: #FDFAF5;
}

.link-icon {
  color: var(--muted);
  font-size: 0.75rem;
  flex-shrink: 0;
}

.link-item-tags {
  padding: 0 1rem 0.4rem;
}

/* Empty state */
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

@media screen and (max-width: 650px) {
  .link-group-header {
    padding: 0.5rem 0.75rem;
  }
}
</style>
