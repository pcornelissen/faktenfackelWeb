<script setup lang="ts">
import { definePageData } from '~/utils/contentUtils'

await definePageData({
  title: 'FAQ – Fragen zu Faktenchecks & Quellen | Faktenfackel',
  pageHeading: 'Faktenfackel - Häufig gestellte Fragen',
  pageSubHeading: 'Das wollte ich immer schon mal wissen',
  description: 'Antworten auf häufige Fragen zu Faktenfackel: Wie arbeiten wir? Wie bewerten wir Quellen? Was bedeuten die Bewertungsstufen? Alles Wissenswerte auf einen Blick.',
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'Was bedeuten die Bewertungsstufen bei Faktenchecks?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Jeder Faktencheck endet mit einer von vier Bewertungen: Falsch (sachlich nicht korrekt), Irreführend (wahrer Kern, aber falscher Eindruck), Komplex (nicht einfach einzuordnen) oder Wahr (korrekt und durch Quellen belegt).',
            },
          },
          {
            '@type': 'Question',
            'name': 'Warum werden direkt Beiträge im Internet verlinkt und die Autoren genannt?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Weil Transparenz wichtig ist. Nur so kann man die Quellen selbst überprüfen und sich eine eigene Meinung bilden. Außerdem ist es fair gegenüber den Autoren, die ihre Meinung in frei zugänglichen Medien veröffentlichen.',
            },
          },
          {
            '@type': 'Question',
            'name': 'Kann ich bei Faktenfackel mithelfen?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Ja, aber es gibt nicht einfach Schreibzugriff für die Seite. Bitte unter kontakt@faktenfackel.de melden – wir besprechen dann alles Weitere.',
            },
          },
        ],
      }),
    },
  ],
})
</script>

<template>
  <div>
    <h1>Häufig gestellte Fragen</h1>
    <h2>Was bedeuten die Bewertungsstufen bei Faktenchecks?</h2>
    <p>
      Jeder Faktencheck endet mit einer von vier Bewertungen:
    </p>
    <ul class="verdict-list">
      <li>
        <VerdictLabel type="false" />
        Die geprüfte Aussage ist sachlich nicht korrekt – sie widerspricht belegten Fakten oder ist schlicht erfunden.
      </li>
      <li>
        <VerdictLabel type="misleading" />
        Die Aussage enthält einen wahren Kern, wird aber so präsentiert oder aus dem Kontext gerissen, dass sie einen falschen Eindruck erweckt.
      </li>
      <li>
        <VerdictLabel type="complex" />
        Die Aussage lässt sich nicht einfach als wahr oder falsch einordnen – der Sachverhalt ist zu vielschichtig, zu wenig belegt oder hängt stark vom Kontext ab.
      </li>
      <li>
        <VerdictLabel type="true" />
        Die Aussage ist korrekt und durch Quellen belegt.
      </li>
    </ul>
    <h2>Warum werden direkt Beiträge im Internet verlinkt und die Autoren genannt?</h2>
    <p>
      Weil Transparenz wichtig ist. Nur so kann man die Quellen selbst überprüfen und sich eine eigene Meinung
      bilden.<br>
      Außerdem ist es fair gegenüber den Autoren, die sich die Mühe gemacht haben, die Inhalte zu erstellen und ihre
      Meinung in den frei zugänglichen Medien kund tun. Wenn sie nicht wollen, dass es im Internet gelesen wird, sollten die Inhalte in geschützen Gruppen und Bereichen veröffentlicht werden. Die Entscheidung liegt beim Autor.
    </p>
    <h2>Super Projekt! Kann ich mithelfen?</h2>
    <p>
      Ja, aber es gibt nicht einfach Schreibzugriff für die Seite.<br>
      Bitte unter <a href="mailto:kontakt@faktenfackel.de">kontakt@faktenfackel.de</a> melden. Wir besprechen dann alles weitere.<br>
      <br>
      <b>ACHTUNG:</b><br>
      Bedrohungen, Beleidigungen, etc. werden ggf. veröffentlicht und zur Anzeige gebracht.
    </p>
  </div>
</template>

<style scoped>
.verdict-list {
  list-style: none;
  padding: 0;
  margin: 0.75rem 0 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.verdict-list li {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}
</style>
