<script setup lang="ts">
import SectionsOverview from '~/components/overview/SectionsOverview.vue'
import Heading from '~/components/layout/Heading.vue'
import { definePageData } from '~/utils/contentUtils'

await definePageData({
  title: 'Faktenchecks - Faktenfackel',
  pageHeading: 'Faktenfackel - Faktenchecks',
  pageSubHeading: 'Themenbereiche',
})
</script>

<template>
  <div class="wide">
    <Heading
      as="h1"
      title="Faktenchecks"
      icon="fake-news"
      icon-txt="Freepik Icon von Scherz Infinite Dendrogram"
    />
    <p class="intro">
      Hier prüfen wir konkrete Behauptungen aus Politik, Medien und sozialen Netzwerken auf ihren Wahrheitsgehalt –
      mit belegten Quellen und einem klaren Urteil. Die Faktenchecks sind nach Themenbereichen gegliedert,
      damit du gezielt nach dem suchen kannst, was dich interessiert.
    </p>
    <SectionsOverview />
  </div>
</template>

<style scoped>
.intro {
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.7;
  max-width: 60ch;
  margin-bottom: 2rem;
}
</style>
