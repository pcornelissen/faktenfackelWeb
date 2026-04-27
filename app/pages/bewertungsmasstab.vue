<script setup lang="ts">
import { definePageData } from '~/utils/contentUtils'

const description = 'Der Bewertungsmaßstab von Faktenfackel erklärt die Urteile Falsch, Irreführend, Komplex und Wahr sowie die Zuordnung im ClaimReview-Markup.'

const verdicts = [
  {
    key: 'false',
    label: 'Falsch',
    summary: 'Die geprüfte Aussage ist sachlich nicht korrekt, widerspricht belastbaren Belegen oder ist erfunden.',
  },
  {
    key: 'misleading',
    label: 'Irreführend',
    summary: 'Die Aussage enthält einen wahren Kern, lässt aber entscheidenden Kontext weg oder erzeugt durch Zuschnitt, Timing oder Darstellung einen falschen Eindruck.',
  },
  {
    key: 'complex',
    label: 'Komplex',
    summary: 'Die Aussage lässt sich nicht sauber als falsch oder wahr einordnen, weil Datenlage, Definitionen, Kontext oder zeitliche Entwicklung entscheidend sind.',
  },
  {
    key: 'true',
    label: 'Wahr',
    summary: 'Die Aussage ist im geprüften Kontext korrekt und durch geeignete Quellen belegt.',
  },
] as const

await definePageData({
  title: 'Bewertungsmaßstab für Faktenchecks - Faktenfackel',
  pageHeading: 'Bewertungsmaßstab',
  pageSubHeading: 'Was die Urteile in Faktenchecks bedeuten',
  description,
})

defineOgImage('Default', { title: 'Bewertungsmaßstab' })

useSeoMeta({
  description,
  ogDescription: description,
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      key: 'verdict-scale',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'DefinedTermSet',
        'name': 'Faktenfackel Bewertungsmaßstab',
        'url': 'https://faktenfackel.de/bewertungsmasstab/',
        'description': description,
        'hasDefinedTerm': verdicts.map(verdict => ({
          '@type': 'DefinedTerm',
          'name': verdict.label,
          'termCode': verdict.key,
          'description': verdict.summary,
        })),
      }),
    },
  ],
})
</script>

<template>
  <article class="scale-page content">
    <h1>Bewertungsmaßstab</h1>

    <p class="lead">
      Faktenfackel bewertet konkrete Behauptungen nach vier sichtbaren Urteilen. Das Urteil bezieht sich immer auf die geprüfte Aussage im beschriebenen Kontext, nicht pauschal auf eine Person, Partei, Quelle oder ob wir dem Thema zustimmen.
    </p>

    <section>
      <h2>Die vier Urteile</h2>
      <div class="verdict-grid">
        <section
          v-for="verdict in verdicts"
          :key="verdict.key"
          class="verdict-card"
        >
          <VerdictLabel :type="verdict.key" />
          <p>{{ verdict.summary }}</p>
        </section>
      </div>
    </section>

    <section>
      <h2>Wie das Urteil entsteht</h2>
      <p>
        Entscheidend sind der Wortlaut der Behauptung, der erkennbare Kontext, die beste verfügbare Quellenlage und die Frage, ob wichtige Einschränkungen fehlen. Primärquellen, amtliche Daten, Originaldokumente und vollständige Aussagen haben dabei mehr Gewicht als Zusammenfassungen oder Ausschnitte.
      </p>
      <p>
        Ein Urteil kann sich ändern, wenn neue Belege auftauchen oder sich die Faktenlage wesentlich verändert. Bei relevanten Änderungen wird der Artikel angepasst und das Änderungsdatum aktualisiert.
      </p>
    </section>

    <section>
      <h2>Maschinenlesbare Auszeichnung</h2>
      <p>
        Das sichtbare Urteil wird zusätzlich in den strukturierten Daten der Faktencheck-Seite hinterlegt. Suchmaschinen können dadurch erkennen, welche Behauptung geprüft wurde und welches Ergebnis Faktenfackel vergibt. Für Leser zählt immer die sichtbare Begründung im Artikel, nicht eine Zahl im Hintergrund.
      </p>
    </section>

    <section>
      <h2>Fehler und Einwände</h2>
      <p>
        Wenn ein Urteil aus deiner Sicht falsch oder unvollständig ist, schick bitte die betroffene URL, die konkrete Stelle und eine überprüfbare Quelle über die
        <NuxtLink to="/kontakt/">
          Kontaktseite
        </NuxtLink>.
      </p>
    </section>
  </article>
</template>

<style scoped>
.scale-page {
  max-width: 820px;
}

.lead {
  font-size: 1.12rem;
  line-height: 1.65;
  color: var(--muted);
}

.verdict-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1rem;
  margin: 1.2rem 0 1.8rem;
}

.verdict-card {
  border: 1px solid var(--fackel-border);
  border-radius: 0.8rem;
  background: #fffaf3;
  padding: 1rem;
}

.verdict-card p {
  margin: 0.75rem 0 0;
}
</style>
