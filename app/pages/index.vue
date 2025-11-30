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
            sub-title="Letzte Änderungen"
            href="/news"
            icon="news-medien"
            icon-txt="<a href=&quot;https://www.flaticon.com/de/kostenlose-icons/nachrichten-medien&quot; title=&quot;Freepik Icon von abstimmung&quot;>Muhammad Yusuf<br/>Freepik</a>"
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
