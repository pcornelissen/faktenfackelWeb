<script setup lang="ts">
const props = defineProps<{
  name?: string
}>()

const slots = useSlots()

function simplify(txt: string) {
  return txt.toLowerCase()
    .replace(' ', '-')
    .replace('\n', '-')
    .replaceAll('/-+/', '-')
}

function extractTextFromVNodes(vnodes) {
  const result = []

  const walk = (nodes) => {
    if (!nodes) return
    for (const node of nodes) {
      if (typeof node.children === 'string') {
        result.push(node.children.trim())
      } else if (Array.isArray(node.children)) {
        walk(node.children)
      }
    }
  }

  walk(vnodes)
  return result.join(' ')
}

const defaultText = computed(() => {
  const vnodes = slots.default?.() ?? []
  return extractTextFromVNodes(vnodes)
})
</script>

<template>
  <a
    :href="`/glossar/${props.name || simplify(defaultText)}`"
    target="_blank"
  >{{ defaultText }}</a>
</template>

<style scoped>
a {
  font-family: Ubuntu-Mono, monospace, serif;
  font-size: 0.95rem
}
</style>
