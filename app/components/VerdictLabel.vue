<script setup lang="ts">
const { type } = defineProps<{
  type: 'false' | 'misleading' | 'complex' | 'true'
}>()

const labels: Record<string, string> = {
  false: '✗ Falsch',
  misleading: '⚠ Irreführend',
  complex: '⚖ Komplex',
  true: '✓ Wahr',
}
</script>

<template>
  <span
    class="verdict"
    :class="`verdict-${type}`"
  >
    {{ labels[type] }}
  </span>
</template>
