<script setup lang="ts">
import { capitalize } from '~/utils/stringUtils'
import { definePageData } from '~/utils/contentUtils'
import { calculateSourceImg, calculateSourceImgAuthor } from '~/pages/quellen/[group]/sources'

const route = useRoute()
const tag = route.params.tag as string

await definePageData({
  title: `Schlagwort: ${capitalize(tag)} – Quellen`,
  pageHeading: '',
})

const { data: sourcesByTagRaw } = await useAsyncData(route.path, () => {
  return queryCollection('quellen')
    .where('tags', 'LIKE', '%"' + tag + '"%')
    .order('name', 'ASC')
    .all()
})
const sourcesByTag = sourcesByTagRaw.value as Source[]

const { data: sourceLinksByTagRaw } = await useAsyncData('sourceLinksByTag', () => {
  return queryCollection('quellenlinks')
    .where('tags', 'LIKE', '%"' + tag + '"%')
    .order('path', 'ASC')
    .all()
})
const sourceLinksByTag = sourceLinksByTagRaw.value as SourceLink[]

const { data: sourcesByLinksRaw }
  = (sourceLinksByTag == null || sourceLinksByTag.length == 0)
    ? { data: { value: [] } }
    : await useAsyncData('sourcelink-sources', () => {
        const builder = queryCollection('quellen').orWhere(
          (query) => {
            new Set(sourceLinksByTag.map(l => l.path)).forEach(s => query = query.where('path', 'LIKE', '/quellen/%/' + s.split('/')[3]))
            return query
          },
        )
        return builder.all()
      })
const sourcesByLinks = sourcesByLinksRaw.value as Source[]

const sourcesMap = new Map<string, { source: Source, links: SourceLink[] }>()

function findLinks(sourceLinks: SourceLink[], source: Source) {
  return sourceLinks.filter(l => l.path.startsWith(source.path + '/'))
}

for (const source of sourcesByLinks as Source[]) {
  sourcesMap.set(source.path.split('/').pop() || source.path, {
    source: source,
    links: findLinks(sourceLinksByTag, source),
  })
}

const totalLinks = sourceLinksByTag?.length ?? 0
const totalSources = sourcesByTag?.length ?? 0
const hasResults = totalLinks + totalSources > 0
</script>

<template>
  <div>
    <NuxtLink
      to="/quellen/tags"
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
      <p
        v-if="hasResults"
        class="page-meta"
      >
        {{ totalSources > 0 ? `${totalSources} Quelle${totalSources !== 1 ? 'n' : ''}` : '' }}{{ totalSources > 0 && totalLinks > 0 ? ' · ' : '' }}{{ totalLinks > 0 ? `${totalLinks} Link${totalLinks !== 1 ? 's' : ''}` : '' }}
      </p>
    </div>

    <div
      v-if="hasResults"
      class="results-layout"
    >
      <!-- Quellen -->
      <section
        v-if="sourcesByTag.length > 0"
        class="results-section"
      >
        <h2 class="section-title">
          <Icon
            name="i-lucide:building-2"
            class="section-icon"
          />
          Quellen
        </h2>
        <div class="source-cards">
          <NuxtLink
            v-for="source in sourcesByTag"
            :key="source.path"
            :to="source.path"
            class="source-card"
          >
            <lazy-nuxt-img
              :src="calculateSourceImg(source)"
              :alt="source.name"
              :title="calculateSourceImgAuthor(source)"
              class="source-card-img"
              placeholder="/files/no-img.svg"
            />
            <div class="source-card-body">
              <div class="source-card-name">
                {{ source.name }}
              </div>
              <div
                v-if="source.description"
                class="source-card-desc"
              >
                {{ source.description }}
              </div>
            </div>
            <Icon
              name="i-lucide:arrow-right"
              class="source-card-arrow"
            />
          </NuxtLink>
        </div>
      </section>

      <!-- Quellenlinks gruppiert nach Quelle -->
      <section
        v-if="sourceLinksByTag.length > 0"
        class="results-section"
      >
        <h2 class="section-title">
          <Icon
            name="i-lucide:link"
            class="section-icon"
          />
          Quellenlinks
        </h2>
        <div class="link-groups">
          <div
            v-for="entry in sourcesMap.values()"
            :key="entry.source.path"
            class="link-group"
          >
            <NuxtLink
              :to="entry.source.path"
              class="link-group-header"
            >
              <lazy-nuxt-img
                :src="calculateSourceImg(entry.source)"
                :alt="entry.source.name"
                class="link-group-img"
                placeholder="/files/no-img.svg"
              />
              <span class="link-group-name">{{ entry.source.name }}</span>
              <span class="link-group-count">{{ entry.links.length }}</span>
            </NuxtLink>
            <ul class="link-list">
              <li
                v-for="link in entry.links"
                :key="link.path"
                class="link-item"
              >
                <NuxtLink
                  :to="link.path"
                  class="link-title"
                >
                  <Icon
                    name="i-lucide:external-link"
                    class="link-icon"
                  />
                  {{ link.title }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
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
      <p>Keine Einträge mit dem Schlagwort „{{ tag }}" gefunden.</p>
      <NuxtLink
        to="/quellen/tags"
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

/* Quellen-Cards */
.source-cards {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.source-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid var(--fackel-border);
  border-radius: 4px;
  text-decoration: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.source-card:hover {
  border-color: var(--flame);
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.source-card-img {
  height: 2rem;
  max-width: 5rem;
  object-fit: contain;
  flex-shrink: 0;
}

.source-card-body {
  flex: 1;
  min-width: 0;
}

.source-card-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--ink);
}

.source-card-desc {
  font-size: 0.8rem;
  color: var(--muted);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.source-card-arrow {
  color: var(--fackel-border);
  flex-shrink: 0;
  transition: color 0.15s, transform 0.15s;
}

.source-card:hover .source-card-arrow {
  color: var(--flame);
  transform: translateX(2px);
}

/* Link-Gruppen */
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
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1rem;
  background: #FDFAF5;
  border-bottom: 1px solid var(--fackel-border);
  text-decoration: none;
  transition: background 0.15s;
}

.link-group-header:hover {
  background: #FAF5EC;
}

.link-group-img {
  height: 1.5rem;
  max-width: 4rem;
  object-fit: contain;
  flex-shrink: 0;
}

.link-group-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--ink);
  flex: 1;
}

.link-group-count {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.7rem;
  color: var(--muted);
  background: var(--fackel-border);
  padding: 1px 6px;
  border-radius: 10px;
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

/* Leerzustand */
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
  .source-card-desc {
    display: none;
  }
}
</style>
