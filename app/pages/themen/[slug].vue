<script setup lang="ts">
import { dateString } from '~/utils/stringUtils'
import { definePageData, nowIso, type Post, type Quote } from '~/utils/contentUtils'
import type { Source, SourceLink } from '~/utils/referenceData'

type MatchTags = {
  any: string[]
  all?: string[]
  exclude?: string[]
}

type FeaturedConfig = {
  faktenchecks?: string[]
  lagerfeuer?: string[]
  glossar?: string[]
  quellenlinks?: string[]
  zitate?: string[]
  quellen?: string[]
}

type ThemePage = {
  title: string
  subtitle: string
  description: string
  intro: string
  path: string
  date: string
  tags: string[]
  matchTags: MatchTags
  featured?: FeaturedConfig
  questions: { question: string, answer: string }[]
}

type TaggedItem = {
  path?: string
  code?: string
  tags?: string[]
  date?: string
}

const route = useRoute()
const slug = route.params.slug as string
const basePath = `/themen/${slug}`

const { data: page } = await useAsyncData(`thema-${slug}`, () =>
  queryCollection('themen').path(basePath).where('publishedOn', '<=', nowIso()).first(),
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Thema nicht gefunden' })
}

const theme = page.value as unknown as ThemePage

await definePageData({
  title: `${theme.title}: Faktenchecks, Quellen und Einordnung - Faktenfackel`,
  pageHeading: theme.title,
  pageSubHeading: theme.subtitle,
  description: theme.description,
  lastmod: new Date(theme.date),
})

defineOgImage('Default', { title: theme.title, label: 'THEMA' })

function normalizeTags(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags.map(String)
  if (tags instanceof Set) return [...tags].map(String)
  return []
}

function normalizePath(path: string | undefined) {
  return (path || '').replace(/\/$/, '')
}

function lowerSet(values: string[] | undefined) {
  return new Set((values || []).map(v => v.toLowerCase()))
}

const anyTags = lowerSet(theme.matchTags.any)
const allTags = lowerSet(theme.matchTags.all)
const excludeTags = lowerSet(theme.matchTags.exclude)

function matchesTheme(item: TaggedItem) {
  const tags = normalizeTags(item.tags).map(t => t.toLowerCase())
  if (excludeTags.size && tags.some(t => excludeTags.has(t))) return false
  if (anyTags.size && !tags.some(t => anyTags.has(t))) return false
  if (allTags.size && ![...allTags].every(t => tags.includes(t))) return false
  return true
}

function byDateDesc<T extends TaggedItem>(items: T[]) {
  return [...items].sort((a, b) =>
    new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime(),
  )
}

function mergeFeaturedByPath<T extends TaggedItem>(items: T[], paths: string[] | undefined, limit: number) {
  const featuredPaths = (paths || []).map(normalizePath)
  const featured = featuredPaths
    .map(path => items.find(item => normalizePath(item.path) === path))
    .filter(Boolean) as T[]
  const featuredPathSet = new Set(featured.map(item => normalizePath(item.path)))
  const automatic = byDateDesc(items.filter(item => matchesTheme(item) && !featuredPathSet.has(normalizePath(item.path))))
  return [...featured, ...automatic].slice(0, limit)
}

function mergeFeaturedByCode<T extends TaggedItem>(items: T[], codes: string[] | undefined, limit: number) {
  const featuredCodes = codes || []
  const featured = featuredCodes
    .map(code => items.find(item => item.code === code))
    .filter(Boolean) as T[]
  const featuredCodeSet = new Set(featured.map(item => item.code))
  const automatic = byDateDesc(items.filter(item => matchesTheme(item) && !featuredCodeSet.has(item.code)))
  return [...featured, ...automatic].slice(0, limit)
}

const { data: hubData } = await useAsyncData(`thema-${slug}-content`, async () => {
  const [faktenchecks, lagerfeuer, glossar, zitate, quellenlinks, quellen, themen] = await Promise.all([
    queryCollection('faktenchecks')
      .select('title', 'subtitle', 'description', 'path', 'publishedOn', 'tags', 'date', 'verdict')
      .where('publishedOn', '<=', nowIso())
      .all(),
    queryCollection('lagerfeuer')
      .select('title', 'subtitle', 'description', 'path', 'publishedOn', 'tags', 'date')
      .where('publishedOn', '<=', nowIso())
      .all(),
    queryCollection('glossar')
      .select('title', 'subject', 'description', 'path', 'publishedOn', 'tags', 'date')
      .where('publishedOn', '<=', nowIso())
      .all(),
    queryCollection('zitate')
      .select('title', 'teaser', 'path', 'publishedOn', 'tags', 'date', 'code')
      .where('publishedOn', '<=', nowIso())
      .all(),
    queryCollection('quellenlinks')
      .select('title', 'uri', 'type', 'path', 'publishedOn', 'tags', 'date', 'sourceDate', 'code', 'coSources')
      .where('publishedOn', '<=', nowIso())
      .all(),
    queryCollection('quellen')
      .select('date', 'name', 'description', 'path', 'tags', 'imageAuthor', 'publishedOn')
      .where('publishedOn', '<=', nowIso())
      .all(),
    queryCollection('themen')
      .select('title', 'subtitle', 'path', 'publishedOn', 'tags', 'date')
      .where('publishedOn', '<=', nowIso())
      .all(),
  ])

  return {
    faktenchecks: mergeFeaturedByPath(faktenchecks as unknown as Post[], theme.featured?.faktenchecks, 8),
    lagerfeuer: mergeFeaturedByPath(lagerfeuer as unknown as Post[], theme.featured?.lagerfeuer, 8),
    glossar: mergeFeaturedByPath(glossar as unknown as Post[], theme.featured?.glossar, 6),
    zitate: mergeFeaturedByCode(zitate as unknown as Quote[], theme.featured?.zitate, 6),
    quellenlinks: mergeFeaturedByCode(quellenlinks as unknown as SourceLink[], theme.featured?.quellenlinks, 10),
    quellen: mergeFeaturedByPath(quellen as unknown as Source[], theme.featured?.quellen, 8),
    relatedThemes: (themen as unknown as ThemePage[])
      .filter(item => item.path !== theme.path)
      .filter(item => normalizeTags(item.tags).some(tag => normalizeTags(theme.tags).includes(tag)))
      .slice(0, 4),
  }
})

const faktenchecks = computed(() => hubData.value?.faktenchecks || [])
const lagerfeuer = computed(() => hubData.value?.lagerfeuer || [])
const glossar = computed(() => hubData.value?.glossar || [])
const zitate = computed(() => hubData.value?.zitate || [])
const quellenlinks = computed(() => hubData.value?.quellenlinks || [])
const quellen = computed(() => hubData.value?.quellen || [])
const relatedThemes = computed(() => hubData.value?.relatedThemes || [])
</script>

<template>
  <div class="wide">
    <NuxtLink
      to="/themen/"
      class="back-link"
    >
      <Icon
        name="i-lucide:arrow-left"
        class="back-icon"
      />
      Alle Themen
    </NuxtLink>

    <header class="theme-header">
      <div class="theme-kicker">
        Themen-Hub
      </div>
      <h1>{{ theme.title }}</h1>
      <p class="theme-subtitle">
        {{ theme.subtitle }}
      </p>
      <p class="theme-date">
        Stand: <time :datetime="String(theme.date)">{{ dateString(theme.date) }}</time>
      </p>
    </header>

    <section class="answer-block">
      <h2>Worum geht es?</h2>
      <p>{{ theme.intro }}</p>
    </section>

    <section
      v-if="faktenchecks.length"
      class="theme-section"
    >
      <div class="section-kicker">
        Faktenchecks
      </div>
      <h2>Wichtige Faktenchecks</h2>
      <PostsList
        :list="faktenchecks"
        :page-size="8"
        icon="i-lucide:check-circle"
      />
    </section>

    <section
      v-if="lagerfeuer.length"
      class="theme-section"
    >
      <div class="section-kicker">
        Einordnung
      </div>
      <h2>Einordnungen und Hintergründe</h2>
      <PostsList
        :list="lagerfeuer"
        :page-size="8"
        icon="i-lucide:flame"
      />
    </section>

    <section
      v-if="glossar.length"
      class="theme-section"
    >
      <div class="section-kicker">
        Glossar
      </div>
      <h2>Begriffe einfach erklärt</h2>
      <PostsList
        :list="glossar"
        :page-size="6"
        icon="i-lucide:book-open"
      />
    </section>

    <section
      v-if="quellenlinks.length"
      class="theme-section"
    >
      <div class="section-kicker">
        Belege
      </div>
      <SourceLinksList
        :list="quellenlinks"
        title-override="Zentrale Quellen und Belege"
      />
    </section>

    <section
      v-if="zitate.length"
      class="theme-section"
    >
      <div class="section-kicker">
        Zitate
      </div>
      <h2>Zitate im Kontext</h2>
      <QuotesList
        :list="zitate"
        :show-source="true"
        :page-size="6"
      />
    </section>

    <section
      v-if="quellen.length"
      class="theme-section"
    >
      <div class="section-kicker">
        Quellenprofile
      </div>
      <h2>Relevante Quellen</h2>
      <SourceCardsList
        :list="quellen"
        :page-size="8"
      />
    </section>

    <section
      v-if="theme.questions.length"
      class="theme-section faq-section"
    >
      <div class="section-kicker">
        Fragen
      </div>
      <h2>Häufige Fragen</h2>
      <details
        v-for="item in theme.questions"
        :key="item.question"
        class="faq-item"
      >
        <summary>{{ item.question }}</summary>
        <p>{{ item.answer }}</p>
      </details>
    </section>

    <section
      v-if="relatedThemes.length"
      class="theme-section related-section"
    >
      <div class="section-kicker">
        Verwandt
      </div>
      <h2>Verwandte Themen</h2>
      <div class="related-grid">
        <NuxtLink
          v-for="item in relatedThemes"
          :key="item.path"
          :to="item.path"
          class="related-card"
        >
          <span class="related-title">{{ item.title }}</span>
          <span class="related-subtitle">{{ item.subtitle }}</span>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 1.4rem;
  color: var(--muted);
  text-decoration: none;
  font-size: 0.92rem;
}

.back-link:hover {
  color: var(--flame);
}

.back-icon {
  font-size: 1rem;
}

.theme-header {
  max-width: 74ch;
  margin-bottom: 1.5rem;
}

.theme-kicker,
.section-kicker {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.76rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--flame);
  font-weight: 600;
  margin-bottom: 0.45rem;
}

.theme-subtitle {
  color: var(--ink);
  font-size: 1.15rem;
  line-height: 1.55;
  margin: 0.4rem 0 0;
}

.theme-date {
  color: var(--muted);
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.82rem;
  margin-top: 0.8rem;
}

.answer-block {
  background: linear-gradient(180deg, white, #FCF8F3);
  border: 1px solid var(--fackel-border);
  border-left: 4px solid var(--flame);
  border-radius: 0.5rem;
  padding: 1.15rem 1.25rem;
  margin: 1.5rem 0 2.4rem;
  max-width: 82ch;
}

.answer-block h2 {
  font-size: 1.2rem;
  margin-bottom: 0.55rem;
}

.answer-block p {
  color: var(--ink);
  line-height: 1.7;
  margin: 0;
}

.theme-section {
  margin-top: 2.7rem;
}

.theme-section h2 {
  margin-bottom: 1rem;
}

.faq-section {
  max-width: 82ch;
}

.faq-item {
  border-top: 1px solid var(--fackel-border);
  padding: 0.8rem 0;
}

.faq-item:last-child {
  border-bottom: 1px solid var(--fackel-border);
}

.faq-item summary {
  cursor: pointer;
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 700;
  color: var(--ink);
}

.faq-item p {
  color: var(--muted);
  line-height: 1.65;
  margin: 0.65rem 0 0;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 0.8rem;
}

.related-card {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  border: 1px solid var(--fackel-border);
  border-radius: 0.5rem;
  background: white;
  padding: 0.9rem 1rem;
  color: var(--ink);
  text-decoration: none;
}

.related-card:hover {
  border-color: #E6C6A7;
}

.related-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 700;
  font-size: 1.1rem;
}

.related-subtitle {
  color: var(--muted);
  line-height: 1.45;
  font-size: 0.92rem;
}

@media screen and (max-width: 560px) {
  .answer-block {
    padding: 1rem;
    margin-bottom: 2rem;
  }

  .theme-section {
    margin-top: 2.2rem;
  }
}
</style>
