<script setup lang="ts">
import { definePageData } from '~/utils/contentUtils'
import SourceCardsList from '~/components/sources/SourceCardsList.vue'

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
  <div>
    <h2 style="margin-top: 0">
      Quellensammlung
    </h2>
    <p>
      Im täglichen Leben begegnen einem immer wieder interessante Links zu Artikeln, Videos etc. Viele sind gut geeignet
      um hier jetzt oder später in Beiträgen genutzt zu werden.<br>
      Zu diesem Zweck werden sie hier abgelegt und thematisch sortiert. Die Quelle selber wird ggf. auch beschrieben,
      weil es interessant ist, wer die Information erstellt/ausgegeben hat.
    </p>
    <p>
      Die Quellensammlung ist nach Quellen organisiert und zu den Quellen gibt es dann thematisch sortierte Listen mit
      Artikeln, Videos, etc.. Dazu gibt es eine
      <nuxt-link to="/quellen/tags">Verschlagwortung (Tags),</nuxt-link>
      um zu Themen quellenübergreifend Dinge finden
      zu können.
    </p>
    <h2>Quellen</h2>
    <div class="mb-2 content-width">
      <div class="text-sm mb-1">
        <span class=" font-bold">Filter</span> <span class=" ">(Filter bilden eine grobe Gruppierung)</span>
      </div>
      <div class="filters flex flex-row flex-wrap gap-2">
        <div
          class="flex items-center gap-2 filter"
          :class="{ 'filter-active': filter === '' }"
          @click="setFilter('')"
        >
          Nicht filtern ({{ all.length || 0 }})
        </div>
        <div
          v-for="filt in filters"
          :key="filt"
          class="flex items-center gap-2 filter "
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
p {
  margin-bottom: 1em;
}

a {
  color: var(--color-secondary);
}

.filter:first-of-type {
  background-color: gray;
  color: white;
}

.filter {
  background-color: lightgray;
  padding: 4px;
  border-radius: 4px;
  border: 1px solid gray;
}

.filter:hover {
  border: 1px solid orange;
}

.filter-active {
  background-color: var(--color-tertiary) !important;
}
</style>
