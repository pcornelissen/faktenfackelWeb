<script setup lang="ts">
import Heading from '~/components/layout/Heading.vue'
import NewsList from '~/news/NewsList.vue'
import { definePageData } from '~/utils/contentUtils'

await definePageData({
  title: 'Änderungen - Faktenfackel',
  pageHeading: 'Faktenfackel - Änderungen',
  pageSubHeading: 'Was hat sich in letzter Zeit geändert?',
})
</script>

<template>
  <div>
    <Heading title="Änderungen" />
    <p class="intro">
      Welche Seiten oder Bereiche haben sich in letzter Zeit geändert?
    </p>
    <NewsList />
  </div>
</template>

<style scoped>
.intro {
  color: var(--muted);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}
</style>
