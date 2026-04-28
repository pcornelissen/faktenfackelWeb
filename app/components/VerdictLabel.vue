<script setup lang="ts">
type VerdictType = 'false' | 'misleading' | 'complex' | 'true'

const props = defineProps<{
  type?: VerdictType | null
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

const verdictType = computed(() => props.type && textLabels[props.type] ? props.type : null)
</script>

<template>
  <NuxtLink
    v-if="verdictType && props.to"
    :to="props.to"
    :title="`Wie kommt das Urteil ${textLabels[verdictType]} zustande?`"
    :aria-label="`Urteil ${textLabels[verdictType]}: Bewertungsmaßstab öffnen`"
    class="verdict verdict-link"
    :class="`verdict-${verdictType}`"
  >
    <span aria-hidden="true">{{ symbols[verdictType] }}</span> {{ textLabels[verdictType] }}
  </NuxtLink>
  <span
    v-else-if="verdictType"
    class="verdict"
    :class="`verdict-${verdictType}`"
  >
    <span aria-hidden="true">{{ symbols[verdictType] }}</span> {{ textLabels[verdictType] }}
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
