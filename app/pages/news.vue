<script setup lang="ts">
import NewsList from '~/news/NewsList.vue'
import { definePageData } from '~/utils/contentUtils'

definePageData({
  title: 'Änderungen - Faktenfackel',
  pageHeading: 'Faktenfackel - Änderungen',
  pageSubHeading: 'Was hat sich in letzter Zeit geändert?',
})
</script>

<template>
  <div>
    <h1>Änderungen</h1>
    <p>Welche Seiten oder Bereiche haben sich in letzter Zeit geändert?</p>
    <NewsList style="margin-top: 1rem" />
  </div>
</template>
