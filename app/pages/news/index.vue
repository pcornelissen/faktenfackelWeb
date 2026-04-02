<script setup lang="ts">
import Heading from '~/components/layout/Heading.vue'
import { definePageData, nowIso } from '~/utils/contentUtils'

await definePageData({
  title: 'Neueste Änderungen & Ergänzungen auf Faktenfackel',
  pageHeading: 'Faktenfackel - Änderungen',
  pageSubHeading: 'Was hat sich in letzter Zeit geändert?',
  description: 'Übersicht der neuesten Änderungen und Ergänzungen auf Faktenfackel – neue Faktenchecks, Quellenlinks, Glossareinträge und Verbesserungen der Seite.',
})

const { data: allNews } = await useAsyncData('news-list', () =>
  queryCollection('news')
    .select('title', 'path', 'date', 'publishedOn')
    .where('publishedOn', '<=', nowIso())
    .order('date', 'DESC')
    .all(),
)

const newsList = computed(() => allNews.value || [])

const { currentPage, totalPages, pageItems, goTo } = usePagination(() => newsList.value, 20)
</script>

<template>
  <div>
    <Heading
      as="h1"
      title="Änderungen"
      icon="news-medien"
      icon-txt="News Icons erstellt von Freepik - Flaticon"
    />
    <p class="intro">
      Welche Seiten oder Bereiche haben sich in letzter Zeit geändert?
    </p>

    <ul
      v-if="pageItems.length"
      class="news-list"
    >
      <li
        v-for="item in pageItems"
        :key="item.path"
        class="news-item"
      >
        <span class="news-date">{{ dateString(item.date) }}</span>
        <NuxtLink
          :to="item.path"
          class="news-link"
        >
          {{ item.title }}
        </NuxtLink>
      </li>
    </ul>

    <p
      v-else
      class="empty"
    >
      Noch keine Neuigkeiten.
    </p>

    <PagerNav
      :current-page="currentPage"
      :total-pages="totalPages"
      @go="goTo"
    />
  </div>
</template>

<style scoped>
.intro {
  color: var(--muted);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.news-list {
  list-style: none;
  padding: 0;
  margin: 0;
  border: 1px solid var(--fackel-border);
  border-top: 2px solid var(--flame);
  border-radius: 4px;
  overflow: hidden;
}

.news-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 9px 16px;
  border-bottom: 1px solid var(--fackel-border);
  background: white;
}

.news-item:last-child {
  border-bottom: none;
}

.news-date {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.8rem;
  color: var(--muted);
  white-space: nowrap;
  margin-top: 2px;
  min-width: 72px;
}

.news-link {
  font-size: 0.9rem;
  color: var(--ink);
  line-height: 1.4;
  text-decoration: none;
}

.news-link:hover {
  color: var(--ember);
}

.empty {
  color: var(--muted);
  font-style: italic;
}
</style>
