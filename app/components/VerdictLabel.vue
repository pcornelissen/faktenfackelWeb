<script setup lang="ts">
const { type } = defineProps<{
  type: 'false' | 'misleading' | 'complex' | 'true'
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
  <span
    class="verdict"
    :class="`verdict-${type}`"
  >
    <span aria-hidden="true">{{ symbols[type] }}</span> {{ textLabels[type] }}
  </span>
</template>
