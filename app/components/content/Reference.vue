<script setup lang="ts">
import { useSlots } from 'vue'

const props = defineProps<{
  code: string
}>()

const slots = useSlots()
const link = referencesStore.linkByCode(props.code)
</script>

<template>
  <div
    v-if="!referencesStore.hasLinkForCode(props.code)"
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
      v-if="referencesStore.hasSourceFor(link.path)"
      class="source"
      :href="link.path || 'LINK '+props.code+' NOT FOUND'"
      :title="`Quelle: ${referencesStore.sourceByLinkPath(link.path).name}`"
    >Quelle</a><span v-else>Quelle nicht gefunden! {{ '/quellen/' + link.path.split('/')[2] }}</span>)
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
