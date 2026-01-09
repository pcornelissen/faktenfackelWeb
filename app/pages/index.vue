<script setup lang="ts">
import NewsList from '~/news/NewsList.vue'
import SectionsOverview from '~/components/overview/SectionsOverview.vue'
import SectionsItem from '~/components/overview/SectionsItem.vue'
import { definePageData } from '~/utils/contentUtils'

await definePageData({
  title: 'Faktenfackel - Wir bringen Licht ins Dunkel',
  pageHeading: 'Faktenfackel - Eine Sammlung von Fakten und Bewertungen',
  pageSubHeading: 'Wir bringen Licht ins Dunkel',
})
</script>

<template>
  <div>
    <h2 style="margin-top: 0">
      Willkommen bei Faktenfackel
    </h2>
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
          <SectionsItem
            title="Neueste Artikel"
            sub-title="Frisch aus der Recherche"
            icon="news-medien"
            icon-txt="Freepik Icon von abstimmung"
          >
            <RecentPosts />
          </SectionsItem>
        </template>
        <template #end>
          <SectionsItem
            title="Kontakt"
            sub-title="Feedback, Vorschläge, ..."
            icon="news-medien"
            icon-txt="Freepik Icon von abstimmung"
          >
            <p>
              Vielen Dank für dein Interesse an Faktenfackel.<br>
              Die Seite ist im Dezember 2025 gestartet und wird kontinuierlich erweitert.<br>
              Schau gerne regelmäßig vorbei, um neue Faktenchecks zu entdecken!
            </p>
            <p>
              Für konstruktives Feedback und Vorschläge sind wir dankbar.
              Einfach per E-Mail an <a href="mailto:kontakt@faktenfackel.de?subject=Feedback%20Faktenfackel-Webseite">kontakt@faktenfackel.de</a>
              (oder im <a href="https://discord.faktenfackel.de">Discord</a>).
            </p>

            <b>ACHTUNG:</b><br>
            Bedrohungen, Beleidigungen, etc. werden ggf. veröffentlicht und zur Anzeige gebracht.
          </SectionsItem>
        </template>
      </SectionsOverview>
    </div>
  </div>
</template>

<style scoped>
p {
  margin-bottom: 1em;
}

a {
  color: var(--color-secondary);
  display: contents;
}

.container {
  display: flex;
}
</style>
