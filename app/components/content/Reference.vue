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
    <slot />
    (Kein Link gefunden! <span class="source">{{ props.code }}</span>
    <icon
      name="i-lucide:bug"
      style="color: red"
      :title="`Link nicht gefunden! (${props.code})`"
    />
    )
  </div>
  <div
    v-else
    style="display: inline"
  >
    <a
      :href="link.uri"
      :title="`Verweis: ${link.title}`"
      class="link"
    >
      <slot v-if="slots.default" />
      <template v-else>{{ link.title }}</template>
    </a>
    <a
      v-if="referencesStore.hasSourceFor(link.path)"
      class="source info-icon"
      :href="link.path || 'LINK '+props.code+' NOT FOUND'"
      :title="`Details zur Quelle von: ${referencesStore.sourceByLinkPath(link.path).name}`"
    >
      <icon
        name="i-lucide:circle-check-big"
      />
    </a>
    <icon
      v-else
      name="i-lucide:bug"
      style="color: red"
      class="info-icon"
      :title="`Quelle nicht gefunden! (${link.path.split('/')[2]})`"
    />
  </div>
</template>

<style scoped>
:root {
  display: inline;
}

.link {
  text-decoration: underline var(--color-tertiary);
}

.info-icon {
  color: var(--color-secondary);
  position: relative;
  top: 2px;
  margin-left: 4px;
  margin-right: 6px;
  transition: ease all .5s;
}

.info-icon:hover {
  color: var(--color-tertiary);
  transition: ease all .5s;
}
</style>
