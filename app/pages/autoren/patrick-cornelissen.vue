<script setup lang="ts">
import { definePageData } from '~/utils/contentUtils'

const authorName = 'Patrick Cornelißen'
const authorImage = '/img/authors/patrick-cornelissen.webp'
const authorImageAlt = authorName
const authorUrl = 'https://faktenfackel.de/autoren/patrick-cornelissen'
const description = 'Patrick Cornelißen ist Diplom-Informatiker und Gründer von Faktenfackel. Er recherchiert zu Desinformation, Politik, Wissenschaft, Technik und Gesellschaft.'

await definePageData({
  title: 'Patrick Cornelißen - Autor bei Faktenfackel',
  pageHeading: authorName,
  pageSubHeading: 'Autor, Recherche und technische Umsetzung',
  description,
})

useSeoMeta({
  ogType: 'profile',
  ogImage: `https://faktenfackel.de${authorImage}`,
  twitterImage: `https://faktenfackel.de${authorImage}`,
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      key: 'person-patrick-cornelissen',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        'name': authorName,
        'url': authorUrl,
        'image': `https://faktenfackel.de${authorImage}`,
        'jobTitle': 'Diplom-Informatiker',
        'description': 'Gründer, Autor und technischer Betreiber von Faktenfackel.',
        'affiliation': {
          '@type': 'Organization',
          'name': 'Faktenfackel',
          'url': 'https://faktenfackel.de',
        },
        'knowsAbout': [
          'Desinformation',
          'Faktenchecks',
          'Politik',
          'Wissenschaft',
          'Technik',
          'Gesellschaft',
        ],
      }),
    },
  ],
})
</script>

<template>
  <article class="author-page content">
    <header class="author-hero">
      <img
        :src="authorImage"
        :alt="authorImageAlt"
        width="220"
        height="220"
        class="author-image"
      >
      <div class="author-intro">
        <p class="eyebrow">
          Autor
        </p>
        <h1>{{ authorName }}</h1>
        <p class="lead">
          Diplom-Informatiker, Gründer von Faktenfackel und verantwortlich für Recherche, technische Umsetzung und redaktionelle Pflege der Seite.
        </p>
      </div>
    </header>

    <section>
      <h2>Kurzprofil</h2>
      <p>
        Mein Name ist Patrick Cornelißen. Ich habe Informatik mit Nebenfach BWL studiert und arbeite bei Faktenfackel an der Schnittstelle von Recherche, Technik und verständlicher Einordnung. Mich interessiert besonders, wie sich Desinformation verbreitet, warum sie wirkt und wie man ihr mit nachvollziehbaren Belegen begegnen kann.
      </p>
      <p>
        Faktenfackel ist aus einem praktischen Problem entstanden: In Diskussionen tauchen immer wieder dieselben falschen oder irreführenden Behauptungen auf. Statt jedes Mal neu zu suchen, sammle ich Quellen, ordne Aussagen ein und mache Belege so auffindbar, dass sie später wiederverwendet werden können.
      </p>
      <p>
        Auf Facebook, Quora und anderen Plattformen begegnen mir regelmäßig Falschaussagen, aus dem Zusammenhang gerissene Zitate und gezielte Desinformation. Eine Behauptung ist in wenigen Sekunden hingeschrieben. Sie sauber zu prüfen, kostet oft Minuten oder Stunden. Faktenfackel soll diese Arbeit wiederverwendbar machen.
      </p>
      <p>
        Deshalb sammle ich nicht nur fertige Faktenchecks, sondern auch Quellenlinks und Zitate. Gerade bei Zitaten ist wichtig, wo und wann sie gefallen sind, ob es ein Video, ein Interview oder eine Primärquelle dazu gibt und welcher Kontext fehlt. So lässt sich besser unterscheiden, ob etwas belegt ist, falsch wiedergegeben wurde oder nur als Behauptung im Raum steht.
      </p>
      <p>
        Ich schreibe zu unterschiedlichen Themen, weil Desinformation selten sauber in ein einziges Fachgebiet passt. Wenn ein Thema nicht in meinem eigenen Hintergrund liegt, arbeite ich mich punktuell ein und verlinke die Quellen, auf denen die Einordnung beruht. Die Leser sollen nicht meiner Meinung glauben müssen, sondern die Grundlage selbst prüfen können.
      </p>
    </section>

    <section>
      <h2>Themen</h2>
      <ul class="topic-list">
        <li>Desinformation und politische Kommunikation</li>
        <li>Rechtsextremismus, Demokratie und Populismus</li>
        <li>Wissenschaft, Technik und digitale Öffentlichkeit</li>
        <li>Statistiken, Behördenquellen und methodische Einordnung</li>
        <li>Transparente Quellenarbeit und wiederverwendbare Belege</li>
      </ul>
    </section>

    <section>
      <h2>Arbeitsweise</h2>
      <p>
        Ich prüfe Behauptungen so, dass die Bewertung nachvollziehbar bleibt: mit direkten Links zu Primärquellen, offiziellen Daten, wissenschaftlichen Arbeiten und seriösen journalistischen Recherchen. Wo eine Aussage nicht eindeutig falsch oder wahr ist, soll die Einordnung genau diese Unsicherheit sichtbar machen.
      </p>
      <p>
        Fehler können passieren. Wichtig ist, dass sie korrigierbar bleiben. Hinweise, Korrekturen und zusätzliche Quellen sind deshalb ausdrücklich willkommen.
      </p>
    </section>

    <section>
      <h2>Kontakt</h2>
      <p>
        Für Hinweise, Korrekturen oder Themenvorschläge erreichst du mich über <a href="mailto:kontakt@faktenfackel.de">kontakt@faktenfackel.de</a>.
      </p>
    </section>
  </article>
</template>

<style scoped>
.author-page {
  padding-bottom: 2rem;
}

.author-hero {
  display: grid;
  grid-template-columns: minmax(140px, 220px) minmax(0, 1fr);
  gap: 2rem;
  align-items: center;
  margin-bottom: 2.5rem;
}

.author-image {
  width: 100%;
  max-width: 220px;
  height: auto;
  border-radius: 6px;
  border: 1px solid var(--fackel-border);
  background: white;
}

.author-intro h1 {
  margin-top: 0.35rem;
}

.eyebrow {
  margin: 0;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--flame);
}

.lead {
  font-size: 1.12rem;
  line-height: 1.65;
  color: var(--muted);
}

.topic-list {
  display: grid;
  gap: 0.65rem;
}

@media (max-width: 680px) {
  .author-hero {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .author-image {
    max-width: 180px;
  }
}
</style>
