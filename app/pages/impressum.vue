<script setup lang="ts">
import { definePageData } from '~/utils/contentUtils'

await definePageData({
  title: 'Faktenfackel Impressum',
  pageHeading: 'Faktenfackel - Impressum',
  pageSubHeading: 'Rechliche Informationen',
})
</script>

<template>
  <div>
    <h2>Impressum</h2>
    <p>
      <strong>faktenfackel</strong> - Patrick Cornelißen<br>
      c/o Online-Impressum.de #5298<br>
      Europaring 90<br>
      53757 Sankt Augustin<br>
    </p>
    <div
      class="mb-4"
    >
      <strong>Kontakt</strong>
      <ul class="list-disc list-inside">
        <li>E-Mail: <a href="mailto:kontakt@faktenfackel.de">kontakt@faktenfackel.de</a></li>
        <li><a href="https://mein.online-impressum.de/faktenfackel/#Zweiter_Kontaktweg">Zweiter Kontaktweg</a></li>
        <li><a href="https://mein.online-impressum.de/faktenfackel/">Social Hub</a></li>
      </ul>
    </div>
    <p>
      <strong>Zuständige Regulierungs- und Aufsichtsbehörde:</strong><br>
      Landesanstalt für Medien Nordrhein-Westfalen<br>
      Sitz: Deutschland<br>
    </p>
  </div>
</template>

<style scoped>
p {
  margin-bottom: 1em;
}
</style>
