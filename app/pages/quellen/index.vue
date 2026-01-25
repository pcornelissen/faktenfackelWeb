<script setup lang="ts">
import { definePageData } from '~/utils/contentUtils'
import SourcesList from '~/components/sources/SourcesList.vue'

await definePageData({
  title: 'Faktenfackel - Wir bringen Licht ins Dunkel',
  pageHeading: 'Quellenliste',
  pageSubHeading: 'Nach Quelle, thematisch sortierte Fundstücke, die (auch) hier in Artikeln verwendet werden',
})

const route = useRoute()

const basePath = route.path

const { data: list1 } = await useAsyncData(basePath, () => {
  return queryCollection('quellen')
    .select('date', 'name', 'description', 'path', 'tags')
    .order('name', 'DESC')
    .all()
})
const list = list1.value as Source[]
</script>

<template>
  <div>
    <h2 style="margin-top: 0">
      Quellensammlung
    </h2>
    <p>
      Im täglichen Leben begegnen einem immer wieder interessante Links zu Artikeln, Videos etc. Viele sind interessant
      um hier jetzt oder später als Quelle genutzt zu werden.<br>
      Zu diesem Zweck werden sie hier abgelegt und thematisch sortiert. Die Quelle selber wird ggf. auch beschrieben,
      weil es interessant ist, wer die Information erstellt/ausgegeben hat.
    </p>
    <p>
      Die Quellensammlung ist nach Quellen organisiert und zu den Quellen gibt es dann thematisch sortierte Listen mit
      Artikeln, Videos, etc.. Dazu gibt es eine
      <nuxt-link to="/quellen/tags">Verschlagwortung (Tags),</nuxt-link>
      um zu Themen quellenübergreifend Dinge finden
      zu können.
    </p>
    <h2>Quellen</h2>
    <SourcesList
      :list="list||[]"
    />
  </div>
</template>

<style scoped>
p {
  margin-bottom: 1em;
}

a {
  color: var(--color-secondary);
}
</style>
