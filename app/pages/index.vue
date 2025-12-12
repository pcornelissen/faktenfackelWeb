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
            title="Seite im Aufbau"
            sub-title="Bitte beachten"
            icon="news-medien"
            icon-txt="Freepik Icon von abstimmung"
          >
            Die Seite und Inhalte befinden sich im Aufbau.<br>
            Es fehlen noch Kleinigkeiten und die Inhalte müssen
            noch abgerundet werden.
          </SectionsItem>
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
        <template #end>
          <SectionsItem
            title="Kontakt"
            sub-title="Feedback, Vorschläge, ..."
            icon="news-medien"
            icon-txt="Freepik Icon von abstimmung"
          >
            Für konstruktives Feedback und Vorschläge sind wir dankbar.
            Einfach per E-Mail an <a href="mailto:kontakt@faktenfackel.de">kontakt@faktenfackel.de</a>.

            <b>ACHTUNG:</b><br>
            Bedrohungen, Beleidigungen, etc. werden ggf. veröffentlicht und zur Anzeige gebracht.
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
