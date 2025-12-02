<script setup lang="ts">
import { definePageData } from '~/utils/contentUtils'

await definePageData({
  title: 'Mehr zu uns - Faktenfackel',
  pageHeading: 'Faktenfackel - Mehr zu uns',
  pageSubHeading: 'Obligatorische Selbstdarstellung',
})
</script>

<template>
  <section class="content">
    <h1>Über uns</h1>
    <p>
      Willkommen bei <strong>Faktenfackel</strong> – deinem Licht im Dickicht der Desinformation.
    </p>
    <p>
      Das Internet bietet unendliche Möglichkeiten, aber leider auch unzählige Behauptungen, Gerüchte und
      Halbwahrheiten.<br>
      <strong>Wir glauben:</strong> Gute Informationen sind ein Grundstein für eine mündige Gesellschaft. Deshalb
      haben wir im Dezember 2025
      Faktenfackel ins Leben gerufen – einer Sammlung, der falsche Aussagen prüft, einordnet und verständlich
      richtigstellt.
    </p>

    <h2>Unsere Mission</h2>
    <p>
      Wir wollen Klarheit schaffen. Ohne Panik, ohne Polemik – dafür mit gründlicher Recherche,
      nachvollziehbaren Quellen und einem klaren Fokus auf Transparenz. Unser Anspruch ist es, komplexe
      Sachverhalte verständlich zu erklären und Mythen dort zu entkräften, wo sie entstehen: im Netz.
    </p>

    <h2>Wie wir arbeiten</h2>
    <ul>
      <li>
        <strong>Sorgfältige Analyse:</strong><br> Wir prüfen virale Aussagen, Memes, Videos und Posts
        systematisch auf ihren Wahrheitsgehalt.
      </li>
      <li>
        <strong>Verlässliche Quellen:</strong><br> Wir stützen uns auf wissenschaftliche Publikationen,
        offizielle Daten, Experteneinschätzungen und Primärquellen.
      </li>
      <li>
        <strong>Klare Einordnung:</strong><br> Wir erklären nicht nur, <em>ob</em> etwas falsch ist, sondern
        <em>warum</em>.
      </li>
      <li>
        <strong>Unabhängig &amp; transparent:</strong><br> Unsere Arbeit ist nicht parteigebunden. Wir legen
        offen, wie wir zu unseren Schlussfolgerungen kommen. Haben wir Quellen nicht gefunden, freuen wir uns über Hinweise.
      </li>
    </ul>

    <h2>Warum gibt es die Faktenfackel?</h2>
    <p>
      Jeden Tag begegnen einem wilde Behauptungen, und man ist sich sicher, dass das irgendwie nicht stimmen kann.
      Man kann sich nicht jedes Mal erneut auf die Suche machen, warum das jetzt ganz falsch ist oder Tatsachen verdreht
      wurden.<br>
      Daher soll Faktenfackel als Sammelbecken dienen, um Recherchen für eine Wiederverwendung zu sammeln und damit auch
      ein Stück digitale Aufklärung zu leisten.<br>
      Es gibt viele, die sich mit Fakten und Belegen nicht umstimmen lassen, aber es wird immer wieder Menschen geben,
      die vom Glauben zum Wissen bekehrt werden können.
    </p>

    <h2>Warum soll man uns glauben?</h2>
    <p>
      Wir recherchieren nach bestem Wissen und Gewissen und legen die Quellen bei. Dann kann man sich ansehen und
      braucht uns nicht glauben.<br>
      Wenn wir etwas übersehen oder falsch verstanden haben, dann freuen wir uns über eine E-Mail an <a
        href="mailto:faktenfackel@mail.de"
      >faktenfackel@mail.de</a>.<br>
      <strong>ACHTUNG:</strong> Beleidigungen, Drohungen etc. werden zur Anzeige gebracht und/oder in öffentlichen
      Beiträgen aufgearbeitet.
    </p>
    <h2>Wer wir sind</h2>
    <p>
      Faktenfackel wird von einem unabhängigen Team von Freiwilligen gefüttert und aktualisiert. Wir kommen aus
      verschiedenen Bereichen und haben uns der Wahrheitsfindung verschrieben, um den Populisten und Scharlatanen
      mit Fakten und Belegen den Wind aus den Segeln zu nehmen.
    </p>
  </section>
</template>

<style scoped>
li{
  margin-bottom: 1rem;
}
</style>
