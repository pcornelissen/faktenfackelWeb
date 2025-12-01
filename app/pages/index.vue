<script setup>
import NewsList from '~/news/NewsList.vue'
import SectionsOverview from '~/components/overview/SectionsOverview.vue'
import SectionsItem from '~/components/overview/SectionsItem.vue'
import { definePageData } from '~/utils/contentUtils.ts'

await definePageData({
  title: 'Faktenfackel - Wir bringen Licht ins Dunkel',
  pageHeading: 'Faktenfackel - Eine Sammlung von Fakten und Bewertungen',
  pageSubHeading: 'Wir bringen Licht ins Dunkel',
})
</script>

<template>
  <div>
    <h1>Willkommen bei Faktenfackel</h1>
    <p>Hier sind Faktenchecks und Bewertungen zu Mythen und Fakenews zu finden.</p>
    <div class="container">
      <SectionsOverview>
        <template #start>
          <SectionsItem
            title="News"
            sub-title="Letzte Änderungen"
            href="/news"
            icon="news-medien"
            icon-txt="Freepik Icon von abstimmung"
          >
            <NewsList :limit="5" />
          </SectionsItem>
        </template>
      </SectionsOverview>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
}
</style>
