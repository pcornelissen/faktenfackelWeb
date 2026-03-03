<script setup lang="ts">
import { definePageData } from '~/utils/contentUtils'
import SourceCardsList from '~/components/sources/SourceCardsList.vue'
import Heading from '~/components/layout/Heading.vue'

await definePageData({
  title: 'Faktenfackel - Wir bringen Licht ins Dunkel',
  pageHeading: 'Quellenliste',
  pageSubHeading: 'Nach Quelle, thematisch sortierte Fundstücke, die hier in Artikeln verwendet werden (können)',
})

const route = useRoute()

const basePath = route.path

const { data: list1 } = await useAsyncData(basePath, () => {
  return queryCollection('quellen')
    .select('date', 'name', 'description', 'path', 'tags', 'image', 'imageAuthor')
    .order('name', 'ASC')
    .all()
})
const filter = ref('')

function setFilter(newFilter: string) {
  filter.value = newFilter
}

const filters = ['Allgemein', 'Medien', 'NGO', 'Personen', 'Portale', 'Statistik', 'Faktenchecks', 'Nachrichten', 'Parteien', 'Politiker', 'Staatlich', 'Wissenschaft']
const sorted = new Map<string, Source[]>()

function matches(path: string, filter: string) {
  return filter === '' || path.toLowerCase().startsWith('/quellen/' + filter.toLowerCase() + '/')
}

const all = (list1.value || []) as Source[]
for (const filt of filters) {
  sorted.set(filt, all.filter(item => matches(item.path, filt)))
}

const filtered = computed(() => {
  return filter.value === '' ? all : sorted.get(filter.value) || []
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
    <nuxt-link
      to="/quellen/tags"
      class="tags-link"
    >
      <icon name="i-mdi:tag-multiple-outline" />
      Zu den Tags
    </nuxt-link>
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
      <div class="filters">
        <div
          class="filter"
          :class="{ 'filter-active': filter === '' }"
          @click="setFilter('')"
        >
          Alle ({{ all.length || 0 }})
        </div>
        <div
          v-for="filt in filters"
          :key="filt"
          class="filter"
          :class="{ 'filter-active': filter === filt }"
          @click="setFilter(filt)"
        >
          {{ filt }} ({{ sorted.get(filt)?.length || 0 }})
        </div>
      </div>
    </div>

    <SourceCardsList
      :list="filtered"
    />
  </div>
</template>

<style scoped>
.tags-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.8rem;
  color: var(--muted);
  text-decoration: none;
  border: 1px solid var(--fackel-border);
  border-radius: 4px;
  padding: 4px 10px;
  margin-bottom: 1.5rem;
  transition: border-color 0.15s, color 0.15s;
}

.tags-link:hover {
  border-color: var(--ember);
  color: var(--ember);
}

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

.filter:hover {
  border-color: var(--ember);
  color: var(--ember);
}

.filter-active {
  background-color: var(--flame) !important;
  color: white !important;
  border-color: var(--flame) !important;
}
</style>
