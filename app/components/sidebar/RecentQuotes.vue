<script setup lang="ts">
import { nowIso } from '~/utils/contentUtils'

const { data: recentQuotesRaw } = await useAsyncData('recent-zitate', () =>
  queryCollection('zitate')
    .select('path', 'title', 'teaser', 'date')
    .where('path', 'NOT LIKE', '%/_info')
    .where('publishedOn', '<=', nowIso())
    .order('date', 'DESC')
    .limit(3)
    .all(),
)
const recentQuotes = recentQuotesRaw.value as Quote[]
</script>

<template>
  <div class="sidebar-box">
    <div class="sidebar-box-header">
      <span class="sidebar-box-title">
        <UIcon
          name="mdi:format-quote-open"
          class="size-3.5"
        /> Neue Zitate
      </span>
    </div>
    <ul class="quote-list">
      <li
        v-for="quote in recentQuotes"
        :key="quote.path"
      >
        <NuxtLink
          :to="quote.path"
          class="quote-item"
        >
          <div class="quote-title">
            {{ quote.title }}
          </div>
          <div
            v-if="quote.teaser"
            class="quote-teaser"
          >
            {{ quote.teaser }}
          </div>
          <UIcon
            name="mdi:arrow-right"
            class="quote-arrow size-3"
          />
        </NuxtLink>
      </li>
    </ul>
    <div class="sidebar-box-footer">
      <NuxtLink to="/zitate">
        Alle Zitate <UIcon
          name="mdi:arrow-right"
          class="size-3"
        />
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.sidebar-box {
  background: white;
  border: 1px solid var(--fackel-border);
  border-radius: 6px;
  overflow: hidden;
}

.sidebar-box-header {
  padding: 10px 16px;
  background: var(--smoke);
  border-bottom: 1px solid #2D2822;
}

.sidebar-box-title {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--flame);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.quote-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.quote-list li {
  border-bottom: 1px solid var(--fackel-border);
}

.quote-list li:last-child {
  border-bottom: none;
}

.quote-item {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  align-items: start;
  gap: 0.1rem 0.5rem;
  padding: 0.6rem 1rem;
  text-decoration: none;
  transition: background 0.15s;
}

.quote-item:hover {
  background: #FDFAF5;
}

.quote-title {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--flame);
  grid-column: 1;
  grid-row: 1;
}

.quote-teaser {
  font-size: 0.83rem;
  color: var(--ink);
  line-height: 1.4;
  grid-column: 1;
  grid-row: 2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.quote-arrow {
  color: var(--fackel-border);
  grid-column: 2;
  grid-row: 1 / 3;
  align-self: center;
  transition: color 0.15s, transform 0.15s;
}

.quote-item:hover .quote-arrow {
  color: var(--flame);
  transform: translateX(2px);
}

.sidebar-box-footer {
  padding: 8px 16px;
  background: rgba(0,0,0,0.02);
  border-top: 1px solid var(--fackel-border);
}

.sidebar-box-footer a {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  color: var(--flame);
  text-decoration: none;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>
