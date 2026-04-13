<script setup lang="ts">
import Heading from '~/components/layout/Heading.vue'
import { definePageData, nowIso } from '~/utils/contentUtils'
import { dateString } from '~/utils/stringUtils'

await definePageData({
  title: 'Neuigkeiten & Ergänzungen auf Faktenfackel',
  pageHeading: 'Faktenfackel - Neuigkeiten',
  pageSubHeading: 'Was hat sich in letzter Zeit geändert?',
  description: 'Übersicht der Neuigkeiten und Ergänzungen auf Faktenfackel – neue Faktenchecks, Quellenlinks, Glossareinträge und Verbesserungen der Seite.',
})

const { data: allNews } = await useAsyncData('news-list', () =>
  queryCollection('news')
    .select('title', 'path', 'date', 'publishedOn', 'teaser')
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
      title="Neuigkeiten"
      icon="news-medien"
      icon-txt="News Icons erstellt von Freepik - Flaticon"
    />
    <p class="intro">
      Welche Seiten oder Bereiche haben sich in letzter Zeit geändert?
    </p>

    <nav
      v-if="pageItems.length"
      class="navigation"
    >
      <ul class="flex flex-col">
        <li
          v-for="item in pageItems"
          :key="item.path"
          class="flex flex-row grow"
        >
          <UIcon
            name="mdi:newspaper-variant-outline"
            class="item-icon size-8"
          />
          <div class="flex flex-row grow gap-2">
            <div class="flex-auto ml-2">
              <NuxtLink
                :to="item.path"
                class="link"
              >
                {{ item.title }}
              </NuxtLink>
              <div
                v-if="item.teaser"
                class="text-sm description"
              >
                {{ item.teaser }}
              </div>
            </div>
            <div class="meta-right">
              <div class="lastChange">
                {{ dateString(item.date) }}
              </div>
            </div>
          </div>
        </li>
      </ul>
    </nav>

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

li {
  font-size: 1rem;
  margin-bottom: 1rem;
  list-style: none;
  border-radius: 0.3rem;
  padding: 0.5rem;
}

li:hover {
  background-color: #FAF6F0;
}

.link {
  display: block;
  margin-bottom: 0.4rem;
}

.meta-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  gap: 0.25rem;
}

.lastChange {
  font-size: 0.6rem;
  font-weight: 200;
  white-space: nowrap;
}

.description {
  font-size: 0.8em;
  margin-bottom: 0.5em;
}

.item-icon {
  flex-shrink: 0;
  color: var(--flame);
  opacity: 0.85;
}

.empty {
  color: var(--muted);
  font-style: italic;
}
</style>
