<script setup lang="ts">
import { useAsyncData } from '#app'
import { useSlots } from 'vue'
import { getSourceFromPath } from '~/utils/contentUtils'

const props = defineProps<{
  code: string
}>()

const { data: linkRaw }
  = await
  useAsyncData(
    `quellenlink-${props.code}`,
    () => {
      console.trace('quellenlinks', 'code', props.code)
      return queryCollection('quellenlinks').where('code', '=', props.code).first()
    })

const link = linkRaw.value as SourceLink
const sourcePath = getSourceFromPath(link?.path || '')

const { data: sourceInfoRaw }
  = await
  useAsyncData(
    `reference-source-${props.code}`,
    () => {
      console.trace('Quellen', sourcePath)
      return queryCollection('quellen').path(sourcePath).first()
    })

const sourceInfo = sourceInfoRaw.value as Source
console.trace('Quelle', sourceInfo)

const slots = useSlots()
</script>

<template>
  <div
    v-if="!link"
    class="bg-warning"
  >
    Kein Link gefunden! {{ props.code }}
  </div>
  <div
    v-else
    style="display: inline"
  >
    <a
      v-if="slots.default"
      :href="link.uri"
      :title="`Verweis: ${link.title}`"
      class="link"
    >
      <slot />
    </a>
    <a
      v-else
      :href="link.uri"
    >Verweis: {{ link.title }}</a>
    &nbsp;(<a
      v-if="sourceInfo"
      class="source"
      :href="link?.path || 'PATH NOT FOUND'"
      :title="`Quelle: ${sourceInfo.name}`"
    >Quelle</a><span v-else>Quelle nicht gefunden!</span>)
  </div>
</template>

<style scoped>
:root {
  display: inline;
}

.link {
  text-decoration: underline var(--color-tertiary);
}

.source {
  font-style: italic;
  font-size: 0.8rem;
  color: var(--color-secondary);
}
</style>
