<script setup lang="ts">
import Heading from '~/components/layout/Heading.vue'
import NewsList from '~/news/NewsList.vue'
import { definePageData } from '~/utils/contentUtils'

await definePageData({
  title: 'Neueste Änderungen & Ergänzungen auf Faktenfackel',
  pageHeading: 'Faktenfackel - Änderungen',
  pageSubHeading: 'Was hat sich in letzter Zeit geändert?',
  description: 'Übersicht der neuesten Änderungen und Ergänzungen auf Faktenfackel – neue Faktenchecks, Quellenlinks, Glossareinträge und Verbesserungen der Seite.',
})
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
    <NewsList />
  </div>
</template>

<style scoped>
.intro {
  color: var(--muted);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}
</style>
