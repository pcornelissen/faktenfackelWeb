<script setup lang="ts">
import { definePageData } from '~/utils/contentUtils'

const description = 'Die Faktenfackel Redaktion verantwortet kuratierte und aggregierte Beitrage, in denen mehrere Quellen ausgewertet, eingeordnet und mit Faktenfackel-Standards gegengeprueft werden. Sie steht namentlich nicht fuer eine einzelne Person, sondern fuer das gemeinsame redaktionelle Vorgehen.'

await definePageData({
  title: 'Faktenfackel Redaktion - Autor bei Faktenfackel',
  pageHeading: 'Faktenfackel Redaktion',
  pageSubHeading: 'Kuratierte und aggregierte Beitraege',
  description,
})

useSeoMeta({
  ogType: 'profile',
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      key: 'person-faktenfackel-redaktion',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': 'https://faktenfackel.de/autoren/redaktion#organization',
        'name': 'Faktenfackel Redaktion',
        'url': 'https://faktenfackel.de/autoren/redaktion',
        'parentOrganization': {
          '@type': 'Organization',
          'name': 'Faktenfackel',
          'url': 'https://faktenfackel.de',
        },
        'description': description,
      }),
    },
  ],
})
</script>

<template>
  <div class="author-shell">
    <div class="author-header">
      <h1 class="author-title">
        Faktenfackel Redaktion
      </h1>
      <p class="author-subtitle">
        Kuratierte und aggregierte Beitraege
      </p>
    </div>

    <div class="author-body content">
      <p>
        Wenn ein Artikel auf Faktenfackel mit „Faktenfackel Redaktion" gezeichnet ist, steht dahinter
        kuratorische und aggregierende Arbeit: mehrere Quellen werden zusammengefuehrt, abgeglichen und
        nach den auf Faktenfackel ueblichen Standards eingeordnet, ohne dass sich daraus eine
        ueberwiegend persoenliche Recherche eines einzelnen Autors ergibt.
      </p>

      <h2>Wann verwendet wird</h2>
      <ul>
        <li>News-Eintraege ueber Plattform-Updates und neu importierte Quellen.</li>
        <li>Artikel, die ueberwiegend Drittquellen referieren und einordnen.</li>
        <li>Kollektive Stellungnahmen, die nicht einer einzelnen Autorin oder einem einzelnen Autor zuzuordnen sind.</li>
      </ul>

      <h2>Verantwortliche Person</h2>
      <p>
        Verantwortlich im Sinne von <NuxtLink to="/impressum">
          §&nbsp;5 TMG und §&nbsp;18 MStV
        </NuxtLink>
        ist <NuxtLink to="/autoren/patrick-cornelissen">
          Patrick Cornelißen
        </NuxtLink>. Anfragen, Korrekturen und Hinweise erreichen
        die Redaktion ueber die im <NuxtLink to="/impressum">
          Impressum
        </NuxtLink> hinterlegten Kontaktwege.
      </p>

      <h2>Methodik</h2>
      <p>
        Wie wir Quellen einordnen, Bewertungen vergeben und Korrekturen handhaben, ist in der
        <NuxtLink to="/about">
          „Ueber uns"-Seite
        </NuxtLink> und in der <NuxtLink to="/faq">
          FAQ
        </NuxtLink> beschrieben.
      </p>
    </div>
  </div>
</template>

<style scoped>
.author-shell {
  background: rgba(255, 255, 255, 0.68);
  border: 1px solid rgba(231, 222, 208, 0.9);
  border-radius: 1.6rem;
  box-shadow: 0 18px 50px rgba(47, 26, 11, 0.06);
  overflow: hidden;
}

.author-header {
  padding: 2.4rem 2.6rem 1.6rem;
  background:
    radial-gradient(circle at top right, rgba(232, 68, 10, 0.1), transparent 32%),
    linear-gradient(180deg, white, #FCF8F3);
  border-bottom: 1px solid var(--fackel-border);
}

.author-title {
  margin: 0;
  font-size: clamp(2rem, 4vw, 2.8rem);
  letter-spacing: -0.03em;
  line-height: 1.05;
}

.author-subtitle {
  font-size: 1.05rem;
  color: var(--muted);
  margin: 0.6rem 0 0;
}

.author-body {
  padding: 1.7rem 2.6rem 2.4rem;
}

@media screen and (max-width: 560px) {
  .author-header {
    padding: 1.7rem 1.2rem 1.2rem;
  }

  .author-body {
    padding: 1.2rem 1.2rem 1.8rem;
  }
}
</style>
