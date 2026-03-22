<script setup lang="ts">
import Heading from '~/components/layout/Heading.vue'
import { definePageData, nowIso } from '~/utils/contentUtils'

const route = useRoute()

await definePageData({
  title: 'Zitate – Faktenfackel',
  pageHeading: 'Faktenfackel - Zitate',
  pageSubHeading: 'Originalzitate zu verschiedenen Themen',
  description: 'Originalzitate von Politikern, Medien und anderen Quellen – gesammelt und eingeordnet von Faktenfackel.',
})

const { data: list1, pending } = useLazyAsyncData(route.path, () => {
  return queryCollection('zitate').where('date', '<=', nowIso()).order('date', 'DESC').all()
}, { server: false })

const search = ref('')

const list = computed(() => (list1.value ?? []) as Quote[])

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return list.value
  return list.value.filter(item =>
    item.title?.toLowerCase().includes(q)
    || item.teaser?.toLowerCase().includes(q),
  )
})
</script>

<template>
  <div>
    <Heading
      as="h1"
      title="Zitate"
      icon="feedback"
      icon-txt="Feedback Icons erstellt von Freepik - Flaticon"
    />

    <p class="intro">
      Die Zitate sind jeweils einer Quelle zugeordnet. Wenn mehrere Personen involviert sind, sind sie im Text zum Zitat referenziert.
      Viele Zitate haben begleitende Einordnungen und Referenzen.
    </p>
    <div
      v-if="pending"
      class="loading"
    >
      <span class="loading-spinner" />
      <span class="loading-text">Zitate werden geladen…</span>
    </div>
    <template v-else>
      <div class="search-wrap">
        <Icon
          name="i-lucide:search"
          class="search-icon"
        />
        <input
          v-model="search"
          type="search"
          aria-label="Zitate durchsuchen"
          placeholder="Zitate durchsuchen…"
          class="search-input"
        >
        <span
          v-if="search"
          class="search-count"
        >{{ filtered.length }} Treffer</span>
      </div>
      <QuotesList
        :list="filtered"
        :show-source="true"
        :page-size="25"
      />
    </template>
  </div>
</template>

<style scoped>
.intro {
  color: var(--muted);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-height: 200px;
}

.loading-spinner {
  display: block;
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--fackel-border);
  border-top-color: var(--flame);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.82rem;
  color: var(--muted);
}

.search-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 1px solid var(--fackel-border);
  border-radius: 4px;
  padding: 0.4rem 0.75rem;
  margin-bottom: 1.5rem;
  transition: border-color 0.15s;
}

.search-wrap:focus-within {
  border-color: var(--flame);
}

.search-icon {
  color: var(--muted);
  font-size: 0.9rem;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  font-family: 'Source Serif 4', serif;
  font-size: 0.9rem;
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

.search-count {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.72rem;
  color: var(--flame);
  white-space: nowrap;
}
</style>
