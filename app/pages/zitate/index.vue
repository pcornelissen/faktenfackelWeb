<script setup lang="ts">
import { definePageData } from '~/utils/contentUtils'

const route = useRoute()

await definePageData({
  title: 'Zitate',
  pageHeading: 'Faktenfackel - Zitate',
  pageSubHeading: 'Originalzitate zu verschiedenen Themen',
  description: '',
})

const limit = 10
const { data: list1 } = await useAsyncData(route.path, () => {
  return queryCollection('zitate')
    .limit(limit)
    .all()
})
const list = list1.value as Quote[]
</script>

<template>
  <div v-if="list">
    <h1 style="margin-top: 0">
      Zitate
    </h1>
    Die letzten {{ limit }} Zitate
    <QuotesList
      :list="list"
      :show-source="true"
    />
  </div>
  <div v-else>
    Moment! Keine Zitate gefunden, hier ist etwas kaputt!<br>
    <br>
    <NuxtLink to="/">
      Zurück zur Startseite
    </NuxtLink>
  </div>
</template>

<style scoped>
</style>
