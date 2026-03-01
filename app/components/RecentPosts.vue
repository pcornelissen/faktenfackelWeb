<script setup lang="ts">
import type { Post } from '~/utils/contentUtils'

// Neueste Artikel aus faktenchecks und lagerfeuer laden
const { data: faktenchecks } = await useAsyncData('recent-faktenchecks', () =>
  queryCollection('faktenchecks')
    .where('path', 'NOT LIKE', '%/_info')
    .order('date', 'DESC')
    .limit(5)
    .all(),
)

const { data: lagerfeuer } = await useAsyncData('recent-lagerfeuer', () =>
  queryCollection('lagerfeuer')
    .order('date', 'DESC')
    .limit(3)
    .all(),
)

// Zusammenführen und nach Datum sortieren
const allPosts = computed(() => {
  const fc = (faktenchecks.value ?? []).map(p => ({ ...p, section: 'Faktencheck' }))
  const lf = (lagerfeuer.value ?? []).map(p => ({ ...p, section: 'Lagerfeuer' }))
  return [...fc, ...lf]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6)
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function categoryLabel(path: string): string {
  const parts = path.split('/').filter(Boolean)
  // /faktenchecks/gesellschaft/migration/... → "Gesellschaft · Migration"
  if (parts[0] === 'faktenchecks' && parts.length >= 3) {
    const cat = parts[1]
    const sub = parts[2]
    return [capitalize(cat), capitalize(sub)].join(' · ')
  }
  if (parts[0] === 'lagerfeuer') return 'Lagerfeuer'
  return capitalize(parts[0] ?? '')
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// tags kann als Set<string> oder string[] ankommen
function hasTag(post: any, tag: string): boolean {
  if (!post.tags) return false
  if (typeof post.tags.has === 'function') return post.tags.has(tag)
  return Array.isArray(post.tags) && post.tags.includes(tag)
}
</script>

<template>
  <div class="recent-posts">
    <template v-if="allPosts.length">
      <!-- ERSTER EINTRAG: Hervorgehoben -->
      <a :href="allPosts[0].path" class="featured-post">
        <div class="featured-meta">
          <span class="post-category">{{ categoryLabel(allPosts[0].path) }}</span>
          <span class="meta-dot">·</span>
          <span class="post-date">{{ formatDate(allPosts[0].date) }}</span>
          <span
            v-if="allPosts[0].section === 'Lagerfeuer'"
            class="section-pill lagerfeuer"
          >Lagerfeuer</span>
        </div>
        <h2 class="featured-title">{{ allPosts[0].title }}</h2>
        <p v-if="allPosts[0].subtitle" class="featured-subtitle">{{ allPosts[0].subtitle }}</p>
        <div class="featured-footer">
          <span
            v-if="hasTag(allPosts[0], 'falsch')"
            class="verdict verdict-false"
          >✗ Falsch</span>
          <span
            v-else-if="hasTag(allPosts[0], 'irreführend')"
            class="verdict verdict-misleading"
          >⚠ Irreführend</span>
          <span
            v-else-if="hasTag(allPosts[0], 'komplex')"
            class="verdict verdict-complex"
          >⚖ Komplex</span>
          <span
            v-else-if="hasTag(allPosts[0], 'wahr')"
            class="verdict verdict-true"
          >✓ Wahr</span>
          <span class="featured-arrow">Zum Artikel →</span>
        </div>
      </a>

      <!-- RESTLICHE EINTRÄGE: Liste -->
      <div class="post-list">
        <a
          v-for="(post, index) in allPosts.slice(1)"
          :key="post.path"
          :href="post.path"
          class="post-item"
        >
          <span class="post-num">0{{ index + 2 }}</span>
          <div class="post-body">
            <div class="post-meta">
              <span class="post-category">{{ categoryLabel(post.path) }}</span>
              <span class="meta-dot">·</span>
              <span class="post-date">{{ formatDate(post.date) }}</span>
              <span
                v-if="post.section === 'Lagerfeuer'"
                class="section-pill lagerfeuer"
              >Lagerfeuer</span>
            </div>
            <div class="post-title">{{ post.title }}</div>
          </div>
          <span
            v-if="hasTag(post, 'falsch')"
            class="verdict verdict-false"
          >✗ Falsch</span>
          <span
            v-else-if="hasTag(post, 'irreführend')"
            class="verdict verdict-misleading"
          >⚠ Irreführend</span>
          <span
            v-else-if="hasTag(post, 'komplex')"
            class="verdict verdict-complex"
          >⚖ Komplex</span>
          <span
            v-else-if="hasTag(post, 'wahr')"
            class="verdict verdict-true"
          >✓ Wahr</span>
        </a>
      </div>
    </template>

    <p v-else class="empty-state">Noch keine Artikel vorhanden.</p>
  </div>
</template>

<style scoped>
.recent-posts {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ── FEATURED ── */
.featured-post {
  display: block;
  background: var(--smoke);
  border-radius: 6px;
  padding: 1.8rem;
  text-decoration: none;
  color: inherit;
  margin-bottom: 1.5rem;
  border: 1px solid #2D2822;
  position: relative;
  transition: border-color 0.2s;
}

.featured-post:hover {
  border-color: var(--flame);
}

.featured-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0.7rem;
  flex-wrap: wrap;
}

.featured-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--paper);
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin: 0 0 0.6rem;
  transition: color 0.15s;
}

.featured-post:hover .featured-title {
  color: var(--ember);
}

.featured-subtitle {
  font-size: 0.88rem;
  color: #9A8F86;
  font-weight: 300;
  line-height: 1.5;
  margin: 0 0 1.2rem;
}

.featured-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.featured-arrow {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.65rem;
  color: var(--flame);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-left: auto;
}

/* ── POST LIST ── */
.post-list {
  display: flex;
  flex-direction: column;
}

.post-item {
  display: grid;
  grid-template-columns: 28px 1fr auto;
  gap: 1rem;
  align-items: start;
  padding: 1rem 0;
  border-bottom: 1px solid var(--fackel-border);
  text-decoration: none;
  color: inherit;
  transition: background 0.1s;
}

.post-item:last-child {
  border-bottom: none;
}

.post-item:hover .post-title {
  color: var(--flame);
}

.post-num {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.62rem;
  color: #C4BAB0;
  padding-top: 3px;
  text-align: right;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 3px;
  flex-wrap: wrap;
}

.post-category {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.58rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}

.meta-dot {
  color: var(--fackel-border);
  font-size: 0.7rem;
}

.post-date {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.58rem;
  color: var(--muted);
}

.post-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.3;
  color: var(--ink);
  transition: color 0.15s;
}

.section-pill {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.55rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 2px;
  font-weight: 600;
}

.section-pill.lagerfeuer {
  background: #F3E8D0;
  color: #92400E;
}

.empty-state {
  color: var(--muted);
  font-style: italic;
  font-size: 0.9rem;
  padding: 1rem 0;
}

/* ── RESPONSIVE ── */
@media screen and (max-width: 560px) {
  .post-item {
    grid-template-columns: 1fr;
    gap: 0.4rem;
  }

  .post-num {
    display: none;
  }

  .featured-post {
    padding: 1.2rem;
  }
}
</style>
