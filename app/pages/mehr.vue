<script setup lang="ts">
import SectionsItem from '~/components/overview/SectionsItem.vue'
import { definePageData } from '~/utils/contentUtils'
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
          :nofollow="true"
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
          :nofollow="true"
          icon-txt="Free Icon von Ahkâm"
          href="https://www.youtube.com/@Faktenfackel"
        >
          <p>
            Wir sind bei Youtube, abonniere den Kanal, um keine Videos zu verpassen.
          </p>
          <a href="https://www.youtube.com/@Faktenfackel">Zum Youtube Kanal</a>
        </SectionsItem>
        <SectionsItem
          title="Bluesky"
          sub-title="Besser als X"
          :nofollow="true"
          icon="bluesky-icon"
          icon-txt="Free Icon von iconpacks.net"
          href="https://bsky.app/profile/faktenfackel.bsky.social"
        >
          <p>
            Wir sind bei Bluesky, abonniere den Kanal, um keine Beiträge zu verpassen oder uns zu schreiben.
          </p>
          <a href="https://bsky.app/profile/faktenfackel.bsky.social">Zu Bluesky</a>
        </SectionsItem>
        <SectionsItem
          title="Mastodon"
          sub-title="Besser als X"
          icon="mastodon-icon"
          :nofollow="true"
          icon-txt="Free Icon von font awesome"
          href="https://mastodon.social/@faktenfackel"
        >
          <p>
            Wir sind bei Mastodon, abonniere den Kanal in Fediverse, um keine Beiträge zu verpassen oder uns zu
            schreiben.
          </p>
          <a href="https://mastodon.social/@faktenfackel">Zu Mastodon.social</a>
        </SectionsItem>
        <SectionsItem
          title="X aka Twitter"
          sub-title="Nur im Notfall nutzen"
          :nofollow="true"
          icon="x-icon"
          icon-txt="Free Icon von font awesome"
          href="https://x.com/faktenfackel"
        >
          <p>
            Wir sind bei X, abonniere den Kanal auf X, um keine Beiträge zu verpassen oder uns zu schreiben.<br>
            Aber ehrlich, willst du wirklich X nutzen?
          </p>
          <a href="https://x.com/faktenfackel">Zu X.com</a>
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
