<script setup lang="ts">
import { definePageData } from '~/utils/contentUtils'
import Heading from '~/components/layout/Heading.vue'

await definePageData({
  title: 'Faktenfackel - Wir bringen Licht ins Dunkel',
  pageHeading: 'Quellenliste',
  pageSubHeading: 'Nach Quelle, thematisch sortierte Fundstücke, die hier in Artikeln verwendet werden (können)',
})

const route = useRoute()
const basePath = route.path

const { data: list1, pending } = useLazyAsyncData(basePath, () => {
  return queryCollection('quellen')
    .select('date', 'name', 'description', 'path', 'tags', 'imageAuthor')
    .order('name', 'ASC')
    .all()
}, { server: false })

const filter = ref('')
const search = ref('')

function setFilter(newFilter: string) {
  filter.value = newFilter
}

const filters = ['Allgemein', 'Medien', 'NGO', 'Personen', 'Portale', 'Statistik', 'Faktenchecks', 'Nachrichten', 'Parteien', 'Politiker', 'Staatlich', 'Wissenschaft']

function matches(path: string, f: string) {
  return f === '' || path.toLowerCase().startsWith('/quellen/' + f.toLowerCase() + '/')
}

const all = computed(() => (list1.value || []) as Source[])

const searchFiltered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return all.value
  return all.value.filter(item =>
    item.name?.toLowerCase().includes(q)
    || item.description?.toLowerCase().includes(q),
  )
})

const sortedMap = computed(() => {
  const map = new Map<string, Source[]>()
  for (const filt of filters) {
    map.set(filt, searchFiltered.value.filter(item => matches(item.path, filt)))
  }
  return map
})

const filtered = computed(() => {
  return filter.value === '' ? searchFiltered.value : sortedMap.value.get(filter.value) || []
})
</script>

<template>
  <div class="wide">
    <Heading
      as="h1"
      title="Quellensammlung"
      icon="news-medien"
      icon-txt="Nachrichten medien Icons erstellt von Muhammad Yusuf - Flaticon"
    />
    <div class="page-intro">
      <p>
        Im täglichen Leben begegnen einem immer wieder interessante Links zu Artikeln, Videos etc. Viele sind gut geeignet
        um hier jetzt oder später in Beiträgen genutzt zu werden.
        Zu diesem Zweck werden sie hier abgelegt und thematisch sortiert. Die Quelle selber wird ggf. auch beschrieben,
        weil es interessant ist, wer die Information erstellt/ausgegeben hat.
      </p>
      <p class="mb-0">
        Die Quellensammlung ist nach Quellen organisiert und zu den Quellen gibt es dann thematisch sortierte Listen mit
        Artikeln, Videos, etc. Dazu gibt es eine Verschlagwortung nach Tags, um Themen quellenübergreifend finden zu können.
      </p>
    </div>
    <div class="filter-section">
      <div class="filter-header">
        <span class="filter-label">Filter</span>
        <span class="filter-count">{{ filtered.length }} {{ filtered.length === 1 ? 'Quelle' : 'Quellen' }}</span>
      </div>
      <div
        class="search-wrap"
        :class="{ 'search-active': search }"
      >
        <Icon
          name="i-lucide:search"
          class="search-icon"
        />
        <input
          v-model="search"
          type="search"
          placeholder="Quellen suchen…"
          class="search-input"
        >
      </div>
      <div class="filters">
        <div
          class="filter"
          :class="{ 'filter-active': filter === '' }"
          @click="setFilter('')"
        >
          Alle ({{ searchFiltered.length || 0 }})
        </div>
        <div
          v-for="filt in filters"
          :key="filt"
          class="filter"
          :class="{ 'filter-active': filter === filt, 'filter-empty': sortedMap.get(filt)?.length === 0 }"
          @click="setFilter(filt)"
        >
          {{ filt }} ({{ sortedMap.get(filt)?.length || 0 }})
        </div>
      </div>
    </div>

    <div
      v-if="pending"
      class="loading"
    >
      <picture>
        <source
          type="image/webp"
          srcset="/img/categories/opt/news-medien-64.webp 64w, /img/categories/opt/news-medien-128.webp 128w"
          sizes="72px"
        >
        <img
          src="/img/categories/news-medien.png"
          alt=""
          class="loading-img"
        >
      </picture>
      <span class="loading-text">Quellen werden geladen…</span>
    </div>
    <LazySourceCardsList
      v-else
      :list="filtered"
    />
  </div>
</template>

<style scoped>
.page-intro {
  background: white;
  border: 1px solid var(--fackel-border);
  border-left: 3px solid var(--flame);
  border-radius: 4px;
  padding: 1.1rem 1.3rem;
  margin-bottom: 2rem;
  font-size: 0.95rem;
  color: var(--muted);
  line-height: 1.6;
}

.page-intro p {
  margin-bottom: 0.6em;
}

.page-intro .mb-0 {
  margin-bottom: 0;
}

.filter-section {
  margin-bottom: 1.5rem;
}

.filter-header {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 0.6rem;
}

.filter-label {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 600;
}

.filter-count {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.7rem;
  color: var(--flame);
}

.search-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 1px solid var(--fackel-border);
  border-radius: 4px;
  padding: 0.35rem 0.75rem;
  margin-bottom: 0.75rem;
  transition: border-color 0.15s;
  max-width: 26rem;
}

.search-wrap:focus-within,
.search-wrap.search-active {
  border-color: var(--flame);
}

.search-icon {
  color: var(--muted);
  font-size: 0.85rem;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  font-family: 'Source Serif 4', serif;
  font-size: 0.88rem;
  color: var(--ink);
  background: none;
  border: none;
  outline: none;
}

.search-input::placeholder {
  color: var(--muted);
  opacity: 0.6;
}

.search-input::-webkit-search-cancel-button {
  -webkit-appearance: none;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.filter {
  background-color: white;
  color: var(--muted);
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px solid var(--fackel-border);
  cursor: pointer;
  font-size: 0.8rem;
  font-family: 'Ubuntu Mono', monospace;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}

.filter:hover:not(.filter-empty) {
  border-color: var(--ember);
  color: var(--ember);
}

.filter-empty {
  opacity: 0.35;
  cursor: default;
  pointer-events: none;
}

.filter-active {
  background-color: var(--flame) !important;
  color: white !important;
  border-color: var(--flame) !important;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  min-height: 320px;
  padding: 3rem 0;
  text-align: center;
}

.loading-img {
  height: 72px;
  opacity: 0.35;
  animation: pulse 1.8s ease-in-out infinite;
}

.loading-text {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.82rem;
  letter-spacing: 0.06em;
  color: var(--muted);
}

@keyframes pulse {
  0%, 100% { opacity: 0.35; }
  50%       { opacity: 0.7; }
}
</style>
