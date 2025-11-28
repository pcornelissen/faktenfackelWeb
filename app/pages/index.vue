<script setup>
import NewsList from '~/news/NewsList.vue'
import SectionsOverview from '~/components/overview/SectionsOverview.vue'
import SectionsItem from '~/components/overview/SectionsItem.vue'

definePageMeta({
  title: 'Faktenfackel - Wir bringen Licht ins Dunkel',
  pageHeading: 'Faktenfackel',
  pageSubHeading: 'Letzte Änderungen'
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
            href="/news"
          >
            <NewsList :limit=5 />
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
