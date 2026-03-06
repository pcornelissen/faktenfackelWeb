<script setup lang="ts">
import { useSlots } from 'vue'

const props = defineProps<{
  code: string
}>()

const slots = useSlots()
const link = computed(() => {
  return referencesStore.linkByCode(props.code)
})
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
  <span
    v-else
    class="ref"
  >
    <a
      :href="link.path"
      :title="`${link.title} – Details auf Faktenfackel`"
      class="ref-text"
    >
      <slot v-if="slots.default" />
      <template v-else>{{ link.title }}</template>
    </a><a
      :href="link.uri"
      target="_blank"
      rel="external noopener"
      :title="`${link.title} – Quelle direkt öffnen`"
      class="ref-external"
    ><icon name="i-lucide:external-link" /></a>
    <icon
      v-if="!referencesStore.hasSourceFor(link.path)"
      name="i-lucide:triangle-alert"
      style="color: orange"
      class="ref-warn"
      :title="`Quellendetails nicht gefunden! (${link.path.split('/')[2]})`"
    />
  </span>
</template>

<style scoped>
.ref {
  display: inline;
}

.ref-text {
  text-decoration: underline var(--flame);
  text-underline-offset: 2px;
  transition: color 0.2s ease;
}

.ref-text:hover {
  color: var(--flame);
}

.ref-external {
  display: inline-flex;
  align-items: center;
  padding: 0 0.2em;
  color: var(--muted);
  font-size: 1em;
  vertical-align: -0.15em;
  position: relative;
  transition: color 0.2s ease;
}

.ref-external:hover {
  color: var(--ember);
}

@media (pointer: coarse) {
  .ref-external::before {
    content: '';
    position: absolute;
    inset: -12px -8px;
  }
}

.ref-warn {
  color: orange;
  font-size: 0.8em;
  vertical-align: middle;
  margin-left: 2px;
}
</style>
