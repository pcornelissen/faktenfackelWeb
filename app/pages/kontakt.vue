<script setup lang="ts">
import { definePageData } from '~/utils/contentUtils'

const description = 'Kontakt zu Faktenfackel: Hinweise, Korrekturen, Quellen, Themenvorschläge und Presseanfragen direkt an die Redaktion senden.'

await definePageData({
  title: 'Kontakt und Korrekturen - Faktenfackel',
  pageHeading: 'Kontakt und Korrekturen',
  pageSubHeading: 'Hinweise, Quellen und Fehlermeldungen',
  description,
})

defineOgImage('Default', { title: 'Kontakt und Korrekturen' })

useSeoMeta({
  description,
  ogDescription: description,
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      key: 'contact-page',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        'name': 'Kontakt und Korrekturen',
        'url': 'https://faktenfackel.de/kontakt/',
        'description': description,
        'mainEntity': {
          '@type': 'Organization',
          'name': 'Faktenfackel',
          'url': 'https://faktenfackel.de',
          'email': 'kontakt@faktenfackel.de',
          'sameAs': [
            'https://discord.faktenfackel.de',
            'https://www.youtube.com/@Faktenfackel',
          ],
        },
      }),
    },
  ],
})
</script>

<template>
  <article class="contact-page content">
    <h1>Kontakt und Korrekturen</h1>

    <p class="lead">
      Hinweise, Korrekturen, Quellen und Themenvorschläge sind ausdrücklich willkommen. Faktenfackel soll nachvollziehbar bleiben, deshalb ist Feedback ein wichtiger Teil der Arbeit.
    </p>

    <section>
      <h2>Kontakt</h2>
      <p>
        Am zuverlässigsten erreichst du die Redaktion per E-Mail an
        <a href="mailto:kontakt@faktenfackel.de">kontakt@faktenfackel.de</a>.
      </p>
      <p>
        Für einen zweiten Kontaktweg, Social-Media-Profile und weitere rechtliche Angaben gibt es das
        <a href="https://mein.online-impressum.de/faktenfackel/">Online-Impressum</a>.
        Austausch ist außerdem über den
        <a href="https://discord.faktenfackel.de">Discord-Server</a>
        möglich.
      </p>
    </section>

    <section>
      <h2>Fehler melden</h2>
      <p>
        Bitte nenne nach Möglichkeit die betroffene URL, die konkrete Stelle, den vermuteten Fehler und eine Quelle, mit der sich der Hinweis prüfen lässt. Auch kleine Hinweise helfen, wenn sie nachvollziehbar sind.
      </p>
      <p>
        Eingehende Korrekturen werden geprüft. Wenn sich ein relevanter Fehler bestätigt, wird der Artikel angepasst. Das Änderungsdatum wird aktualisiert, sobald sich die inhaltliche Einordnung wesentlich geändert hat.
      </p>
    </section>

    <section>
      <h2>Was besonders hilft</h2>
      <ul>
        <li>Primärquellen, amtliche Daten, Urteile, Originalvideos oder vollständige Transkripte.</li>
        <li>Hinweise auf fehlenden Kontext, veraltete Daten oder missverständliche Formulierungen.</li>
        <li>Konkrete Themenvorschläge mit Link zur ursprünglichen Behauptung.</li>
      </ul>
    </section>

    <section>
      <h2>Was nicht hilft</h2>
      <p>
        Pauschale Vorwürfe ohne überprüfbare Quelle lassen sich nicht sinnvoll bearbeiten. Beleidigungen, Drohungen oder Einschüchterungsversuche werden nicht als inhaltliche Hinweise behandelt.
      </p>
    </section>
  </article>
</template>

<style scoped>
.contact-page {
  max-width: 760px;
}

.lead {
  font-size: 1.12rem;
  line-height: 1.65;
  color: var(--muted);
}
</style>
