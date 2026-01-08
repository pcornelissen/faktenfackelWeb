<script setup lang="ts">
import { definePageData } from '~/utils/contentUtils'
import { capitalize } from '~/utils/stringUtils'

const route = useRoute()

const title = 'Quellenlink-Schlagwörter'

await definePageData({
  title: title,
  pageHeading: 'Faktenfackel - Schlagwörter von Quellenlinks',
})

const { data: list1 } = await useAsyncData(route.path, () => {
  return queryCollection('quellenlinks')
    .select('tags')
    .all()
})

const tagMap = (
  list1.value ? list1.value.map(t => t.tags).flat() : []
).reduce(function (r, a) {
  r.set(a, (r.get(a) || 0) + 1)
  return r
}, new Map<string, number>())
const tagKeys = tagMap.keys().toArray().sort()
</script>

<template>
  <div>
    <h2 style="margin-top: 0">
      {{ title }}
    </h2>
    <div class="flex">
      <NuxtLink
        v-for="tag in tagKeys"
        :key="tag"
        :to="`/quellen/tags/${tag}`"
        class="tag"
      >
        {{ capitalize(tag) }} (#{{ tagMap.get(tag) }})
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.tag {
  font-size: 0.8rem;
  font-weight: 200;
  background-color: var(--color-tertiary);
  color: #fff;
  padding: 0.2rem 0.4rem;
  margin: 0.2rem 0.4rem;
  border-radius: 0.2rem;
}
</style>
