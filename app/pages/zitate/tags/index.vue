<script setup lang="ts">
import { definePageData } from '~/utils/contentUtils'
import { capitalize } from '~/utils/stringUtils'

const route = useRoute()

const title = 'Zitate - Schlagwörter'

await definePageData({
  title: title,
  pageHeading: 'Faktenfackel - Schlagwörter von Zitaten',
})

const { data: list1 } = await useAsyncData(route.path, () => {
  return queryCollection('zitate')
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

const maxCount = Math.max(...tagMap.values())
const midCount = tagMap.values().reduce((a, b) => a + b) / tagMap.size
const midMaxCount = Math.max(...tagMap.values().filter(v => v <= midCount))

const baseColor = '#F98C35'
const midColor = '#F9aCa5'
const minColor = '#999C95'

function getColor(count: number) {
  if (count > midCount) {
    const ratio = (count - midCount) / (maxCount - midCount)
    const ratioReverse = 1 - ratio
    return toHex(fromHex(baseColor, 1) * ratio + fromHex(midColor, 1) * ratioReverse,
      fromHex(baseColor, 3) * ratio + fromHex(midColor, 3) * ratioReverse,
      fromHex(baseColor, 5) * ratio + fromHex(midColor, 5) * ratioReverse)
  } else {
    const ratio = (count) / (midMaxCount)
    const ratioReverse = 1 - ratio
    return toHex(fromHex(midColor, 1) * ratio + fromHex(minColor, 1) * ratioReverse,
      fromHex(midColor, 3) * ratio + fromHex(minColor, 3) * ratioReverse,
      fromHex(midColor, 5) * ratio + fromHex(minColor, 5) * ratioReverse)
  }
}

function fromHex(color: string, pos: number) {
  return parseInt(color.slice(pos, pos + 2), 16)
}

function toHex(colorR: number, colorG: number, colorB: number) {
  return '#' + Math.round(colorR).toString(16) + Math.round(colorG).toString(16) + Math.round(colorB).toString(16)
}
</script>

<template>
  <div>
    <h2 style="margin-top: 0">
      {{ title }}
    </h2>
    <div class="content-width mb-4">
      Die Schlagwörter sind alphabetisch sortiert und eingefärbt, um die Menge der zugeordneten Artikel erkenntlich zu machen.
    </div>
    <div class="flex flex-wrap">
      <NuxtLink
        v-for="tag in tagKeys"
        :key="tag"
        :to="`/zitate/tags/${tag}`"
        class="tag"
        :color=" getColor(tagMap.get(tag)||0) "
        :style="{ backgroundColor: getColor(tagMap.get(tag)||0) }"
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
