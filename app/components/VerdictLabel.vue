<script setup lang="ts">
const { type, to } = defineProps<{
  type: 'false' | 'misleading' | 'complex' | 'true'
  to?: string
}>()

const symbols: Record<string, string> = {
  false: '✗',
  misleading: '⚠',
  complex: '⚖',
  true: '✓',
}

const textLabels: Record<string, string> = {
  false: 'Falsch',
  misleading: 'Irreführend',
  complex: 'Komplex',
  true: 'Wahr',
}
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :title="`Wie kommt das Urteil ${textLabels[type]} zustande?`"
    :aria-label="`Urteil ${textLabels[type]}: Bewertungsmaßstab öffnen`"
    class="verdict verdict-link"
    :class="`verdict-${type}`"
  >
    <span aria-hidden="true">{{ symbols[type] }}</span> {{ textLabels[type] }}
  </NuxtLink>
  <span
    v-else
    class="verdict"
    :class="`verdict-${type}`"
  >
    <span aria-hidden="true">{{ symbols[type] }}</span> {{ textLabels[type] }}
  </span>
</template>

<style scoped>
.verdict-link {
  text-decoration: none;
  transition: filter 0.15s, box-shadow 0.15s;
}

.verdict-link:hover,
.verdict-link:focus-visible {
  filter: brightness(0.96);
  box-shadow: 0 0 0 2px rgba(249, 140, 53, 0.35);
}
</style>
