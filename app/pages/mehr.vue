<script setup>
import SectionsItem from '~/components/overview/SectionsItem.vue'
import { definePageData } from '~/utils/contentUtils.ts'
import Sections from '~/components/overview/Sections.vue'

await definePageData({
  title: 'Faktenfackel - Wir bringen Licht ins Dunkel',
  pageHeading: 'Andere Faktenfackel Seiten',
  pageSubHeading: 'Wir sind überall für dich da',
})
</script>

<template>
  <div>
    <h2 style="margin-top: 0">
      Wir sind zu finden unter...
    </h2>
    <div class="container">
      <Sections>
        <SectionsItem
          title="Discord"
          sub-title="Feedback, Vorschläge, ..."
          icon="discord-icon"
          icon-txt="Free Icon von Ahkâm"
          href="https://discord.faktenfackel.de"
        >
          <p>
            Es gibt ein Faktenfackel Discord, in dem über Faktenchecks, Themenvorschläge und sonstiges rund um
            Faktenfackel diskutiert werden kann.
          </p>
          Links:
          <a href="https://discord.faktenfackel.de">Einladungslink für den Beitritt</a><br>
          <a href="https://discord.faktenfackel.de/server">Direktlink zum Server</a>
        </SectionsItem>
        <SectionsItem
          title="Youtube"
          sub-title="Man muss nicht immer lesen"
          icon="youtube-icon"
          icon-txt="Free Icon von Ahkâm"
          href="https://www.youtube.com/@Faktenfackel"
        >
          <p>
            Wir sind bei Youtube, abonniere den Kanal, um keine Videos zu verpassen.
          </p>
          <a href="https://www.youtube.com/@Faktenfackel">Zum Youtube Kanal</a>
        </SectionsItem>
      </Sections>
    </div>
  </div>
</template>

<style scoped>
p {
  margin-bottom: 1em;
}

a {
  color: var(--color-secondary);
}

.container {
  display: flex;
}
</style>
