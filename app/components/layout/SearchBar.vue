<script setup lang="ts">
interface Hit {
  path: string
  title: string
  excerpt: string
  collection: string
}

type CollectionKey = 'faktenchecks' | 'lagerfeuer' | 'glossar' | 'zitate' | 'quellen' | 'quellenlinks'

const COLLECTION_LABELS: Record<CollectionKey, string> = {
  faktenchecks: 'Faktencheck',
  lagerfeuer: 'Lagerfeuer',
  glossar: 'Glossar',
  zitate: 'Zitat',
  quellen: 'Quelle',
  quellenlinks: 'Quellenlink',
}

interface FilterChip {
  key: CollectionKey | ''
  label: string
}

const FILTER_CHIPS: FilterChip[] = [
  { key: '', label: 'Alle' },
  { key: 'faktenchecks', label: 'Faktenchecks' },
  { key: 'lagerfeuer', label: 'Lagerfeuer' },
  { key: 'quellen', label: 'Quellen' },
  { key: 'zitate', label: 'Zitate' },
  { key: 'glossar', label: 'Glossar' },
  { key: 'quellenlinks', label: 'Quellenlinks' },
]

const open = ref(false)
const term = ref('')
const results = ref<Hit[]>([])
const counts = ref<Record<string, number>>({})
const loading = ref(false)
const activeType = ref<CollectionKey | ''>('')
let controller: AbortController | null = null
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const hasActiveCounts = computed(() => term.value.trim().length >= 2 && Object.keys(counts.value).length > 0)

watch(term, (q) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (q.trim().length < 2) {
    results.value = []
    counts.value = {}
    loading.value = false
    return
  }
  debounceTimer = setTimeout(() => runSearch(q.trim()), 150)
})

async function runSearch(q: string) {
  let didAbort = false
  controller?.abort()
  controller = new AbortController()
  loading.value = true
  try {
    const query: Record<string, string> = { q }
    if (activeType.value) query.type = activeType.value
    const data = await $fetch<{ results: Hit[], counts: Record<string, number> }>('/api/search', {
      query,
      signal: controller.signal,
    })
    results.value = data.results
    counts.value = data.counts ?? {}
  } catch (e) {
    const err = e as { name?: string, cause?: { name?: string } }
    const isAbort = err.name === 'AbortError' || err.cause?.name === 'AbortError'
    if (isAbort) {
      didAbort = true
    } else {
      results.value = []
      counts.value = {}
    }
  } finally {
    if (!didAbort) loading.value = false
  }
}

function selectType(key: CollectionKey | '') {
  activeType.value = key
  if (term.value.trim().length >= 2) {
    runSearch(term.value.trim())
  }
}

function collectionLabel(collection: string): string {
  return COLLECTION_LABELS[collection as CollectionKey] ?? collection
}

function openModal() {
  term.value = ''
  results.value = []
  counts.value = {}
  activeType.value = ''
  open.value = true
}

function chipCount(key: CollectionKey | ''): number {
  if (!hasActiveCounts.value) return 0
  return key === '' ? (counts.value.all ?? 0) : (counts.value[key] ?? 0)
}

function closeAndNavigate() {
  open.value = false
}

// Cmd+K / Ctrl+K global shortcut
onMounted(() => {
  window.addEventListener('keydown', onGlobalKey)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onGlobalKey)
  if (debounceTimer) clearTimeout(debounceTimer)
  controller?.abort()
})

function onGlobalKey(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    openModal()
  }
}
</script>

<template>
  <div>
    <!-- Trigger button: same visual style as the old UContentSearchButton via app.config.ts -->
    <button
      class="search-trigger"
      aria-label="Suche öffnen"
      @click="openModal"
    >
      <UIcon
        name="i-lucide-search"
        class="search-icon"
        aria-hidden="true"
      />
      <span class="search-label">Suchen</span>
    </button>

    <!-- Search modal -->
    <UModal
      v-model:open="open"
      title="Suche"
      :ui="{ content: 'bg-[var(--paper)]' }"
    >
      <template #body>
        <div class="search-body">
          <label
            for="fackel-search-input"
            class="sr-only"
          >Suchbegriff eingeben</label>
          <UInput
            id="fackel-search-input"
            v-model="term"
            placeholder="Suche nach Inhalten …"
            autofocus
            icon="i-lucide-search"
            size="lg"
            :ui="{
              root: 'w-full',
              base: 'bg-[var(--ash)] text-[var(--paper)] placeholder:text-[var(--muted)]',
            }"
          />

          <!-- Type filter chips -->
          <div
            class="type-filter"
            role="group"
            aria-label="Nach Typ filtern"
          >
            <button
              v-for="chip in FILTER_CHIPS"
              :key="chip.key"
              class="type-chip"
              :class="{
                'type-chip--active': activeType === chip.key,
                'type-chip--empty': hasActiveCounts && chipCount(chip.key) === 0,
              }"
              :aria-pressed="activeType === chip.key"
              @click="selectType(chip.key)"
            >
              {{ chip.label }}<span
                v-if="hasActiveCounts"
                class="chip-count"
                :class="{ 'chip-count--active': activeType === chip.key }"
              >{{ chipCount(chip.key) }}</span>
            </button>
          </div>

          <!-- Status messages -->
          <p
            v-if="loading"
            class="search-status"
            aria-live="polite"
          >
            Sucht …
          </p>
          <p
            v-else-if="term.trim().length >= 2 && results.length === 0"
            class="search-status"
            aria-live="polite"
          >
            Keine Treffer für "{{ term.trim() }}".
          </p>

          <!-- Results list -->
          <ul
            v-if="results.length > 0"
            class="search-results"
            aria-label="Suchergebnisse"
          >
            <li
              v-for="(hit, i) in results"
              :key="`${hit.path}#${i}`"
              class="search-result"
            >
              <NuxtLink
                :to="hit.path"
                class="search-result-link"
                @click="closeAndNavigate"
              >
                <span class="search-result-meta">
                  <span class="search-result-type">{{ collectionLabel(hit.collection) }}</span>
                </span>
                <span class="search-result-title">{{ hit.title }}</span>
                <span
                  v-if="hit.excerpt"
                  class="search-result-excerpt"
                >{{ hit.excerpt }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
/* Eigene Tokens fuer den Trigger-Button, die dem alten contentSearchButton-Stil entsprechen.
   Diese Farben sind nicht im globalen Token-Set, aber hier namentlich verankert. */
:root,
.search-trigger {
  --search-trigger-fg: #D1C5B7;
  --search-trigger-border: #4B4038;
}

/* Trigger button - matches old UContentSearchButton appearance */
.search-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--search-trigger-fg);
  border: 1px solid var(--search-trigger-border);
  border-radius: 999px;
  padding: 0.5rem 0.875rem;
  min-height: 2.75rem;
  background: transparent;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
  white-space: nowrap;
}

.search-trigger:hover {
  color: var(--flame);
  border-color: var(--flame);
}

.search-icon {
  color: var(--flame);
  width: 0.875rem;
  height: 0.875rem;
  flex-shrink: 0;
}

/* Screen-reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Modal body */
.search-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.search-status {
  font-size: 0.875rem;
  color: var(--muted);
  padding: 0.25rem 0;
}

/* Type filter chips */
.type-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.type-chip {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  border: 1px solid var(--fackel-border);
  border-radius: 999px;
  padding: 0.2rem 0.625rem;
  background: transparent;
  cursor: pointer;
  transition: color 0.12s, border-color 0.12s, background 0.12s;
  white-space: nowrap;
  line-height: 1.6;
}

.type-chip:hover {
  color: var(--flame);
  border-color: var(--flame);
}

.type-chip--active {
  color: var(--flame);
  border-color: var(--flame);
  background: color-mix(in srgb, var(--flame) 10%, transparent);
}

.type-chip--empty {
  opacity: 0.45;
}

.chip-count {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.72rem;
  font-style: normal;
  color: var(--muted);
  margin-left: 0.35em;
  vertical-align: baseline;
  opacity: 0.85;
  line-height: 1;
}

.chip-count--active {
  color: var(--flame);
}

/* Results */
.search-results {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--fackel-border);
  max-height: 60vh;
  overflow-y: auto;
}

.search-result {
  border-bottom: 1px solid var(--fackel-border);
}

.search-result:last-child {
  border-bottom: none;
}

.search-result-link {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.75rem 0.25rem;
  text-decoration: none;
  transition: background 0.12s;
  border-radius: 4px;
}

.search-result-link:hover,
.search-result-link:focus-visible {
  background: color-mix(in srgb, var(--flame) 8%, transparent);
  outline: none;
}

.search-result-link:focus-visible {
  outline: 2px solid var(--flame);
  outline-offset: 2px;
}

.search-result-meta {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.search-result-type {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--flame);
  flex-shrink: 0;
}

.search-result-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--ink);
  line-height: 1.3;
}

.search-result-excerpt {
  font-size: 0.82rem;
  color: var(--muted);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
