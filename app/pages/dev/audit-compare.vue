<script setup lang="ts">
interface AuditPair {
  key: string
  before: string | null
  after: string | null
}

definePageMeta({ layout: false })
useHead({ title: 'Audit Compare', meta: [{ name: 'robots', content: 'noindex,nofollow' }] })

const { data: pairs } = await useFetch<AuditPair[]>('/api/dev/audit-screenshots', {
  default: () => [],
})

const showAfter = ref<Record<string, boolean>>({})

function imgSrc(file: string | null) {
  if (!file) return ''
  return `/api/dev/audit-screenshot?file=${encodeURIComponent(file)}`
}

function toggle(key: string) {
  showAfter.value[key] = !showAfter.value[key]
}

function humanize(key: string) {
  return key.replace(/-/g, ' ')
}

const completeCount = computed(() => pairs.value.filter(p => p.before && p.after).length)
const onlyBeforeCount = computed(() => pairs.value.filter(p => p.before && !p.after).length)
</script>

<template>
  <div class="audit-page">
    <header class="audit-header">
      <h1>Impeccable Audit – Vorher / Nachher</h1>
      <p class="lede">
        Klicke ein Bild, um zwischen Vorher und Nachher umzuschalten. Lokale Dev-Seite, im Production-Build ausgeschlossen.
      </p>
      <p class="meta">
        {{ pairs.length }} Pärchen · {{ completeCount }} vollständig · {{ onlyBeforeCount }} ohne Nachher-Bild
      </p>
    </header>

    <div
      v-if="pairs.length === 0"
      class="empty"
    >
      Keine Screenshots gefunden in <code>docs/impeccable-audit-screenshots/</code>.
    </div>

    <ul class="grid">
      <li
        v-for="pair in pairs"
        :key="pair.key"
        class="card"
      >
        <div class="card-header">
          <h2>{{ humanize(pair.key) }}</h2>
          <span
            class="badge"
            :class="showAfter[pair.key] ? 'badge-after' : 'badge-before'"
          >
            {{ showAfter[pair.key] ? 'Nachher' : 'Vorher' }}
          </span>
        </div>

        <button
          v-if="pair.before || pair.after"
          type="button"
          class="img-btn"
          :disabled="!(pair.before && pair.after)"
          :aria-label="`${pair.key}: zwischen Vorher und Nachher umschalten`"
          @click="toggle(pair.key)"
        >
          <img
            :src="imgSrc(showAfter[pair.key] ? pair.after : pair.before) || imgSrc(pair.before || pair.after)"
            :alt="`${pair.key} – ${showAfter[pair.key] ? 'Nachher' : 'Vorher'}`"
            loading="lazy"
          >
        </button>

        <div class="card-foot">
          <span :class="{ missing: !pair.before }">vorher: {{ pair.before ?? '—' }}</span>
          <span :class="{ missing: !pair.after }">nachher: {{ pair.after ?? '—' }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.audit-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1.25rem 4rem;
  font-family: 'Source Serif 4', serif;
  color: var(--ink);
  background: var(--paper);
  min-height: 100vh;
}

.audit-header {
  border-bottom: 1px solid var(--fackel-border);
  padding-bottom: 1.25rem;
  margin-bottom: 1.75rem;
}

.audit-header h1 {
  font-family: 'Playfair Display', serif;
  font-weight: 900;
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  margin: 0 0 0.4rem;
  letter-spacing: -0.01em;
}

.lede {
  margin: 0 0 0.4rem;
  color: var(--muted);
  max-width: 70ch;
}

.meta {
  margin: 0;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.78rem;
  color: var(--muted);
  letter-spacing: 0.05em;
}

.empty {
  padding: 3rem 1rem;
  text-align: center;
  border: 1px dashed var(--fackel-border);
  border-radius: 0.5rem;
  color: var(--muted);
}

.grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(420px, 100%), 1fr));
  gap: 1.5rem;
}

.card {
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid var(--fackel-border);
  border-radius: 0.5rem;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.85rem 1rem 0.6rem;
  border-bottom: 1px solid var(--fackel-border);
}

.card-header h2 {
  margin: 0;
  font-family: 'Playfair Display', serif;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  text-transform: capitalize;
}

.badge {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.18rem 0.5rem;
  border-radius: 999px;
  white-space: nowrap;
}

.badge-before {
  background: var(--fackel-border);
  color: var(--ink);
}

.badge-after {
  background: var(--flame);
  color: white;
}

.img-btn {
  appearance: none;
  background: repeating-conic-gradient(#f4eee4 0 25%, #ece5d8 0 50%) 0 0 / 24px 24px;
  border: 0;
  padding: 0;
  cursor: pointer;
  display: block;
  width: 100%;
}

.img-btn:disabled {
  cursor: default;
  opacity: 0.85;
}

.img-btn img {
  display: block;
  width: 100%;
  height: auto;
  transition: opacity 0.18s;
}

.card-foot {
  padding: 0.55rem 1rem 0.85rem;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.68rem;
  color: var(--muted);
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  word-break: break-all;
}

.card-foot .missing {
  color: var(--ember);
}
</style>
