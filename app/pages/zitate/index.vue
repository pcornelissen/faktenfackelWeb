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
  <div
    v-if="list"
    class="content-width"
  >
    <h1 style="margin-top: 0">
      Zitate
    </h1>
    <nuxt-link
      to="/zitate/tags"
      style="display: flex; vertical-align: middle; margin-bottom: 1rem;"
    >
      <icon
        name="i-lucide:arrow-right"
        style="margin-right: 0.5rem; "
      />Zitate nach Schlagworten</nuxt-link>
    Die Zitate sind jeweils einer Quelle zugeordnet. Wenn mehrere Personen involviert sind, sind sie im Text zum Zitat referenziert.
    Viele Zitate haben begleitende Einordnungen und Referenzen.
    <h2>Die letzten {{ limit }} Zitate</h2>
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
