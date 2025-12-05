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

function extractTextFromVNodes(vnodes: VNode[]) {
  const result: string[] = []

  const walk = (nodes: VNode[]) => {
    if (!nodes) return
    for (const node of nodes) {
      if (typeof node.children === 'string') {
        result.push(node.children.trim())
      } else if (Array.isArray(node.children)) {
        walk(node.children as VNode[])
      }
    }
  }

  walk(vnodes)
  return result.join(' ')
}

function extractBody() {
  return extractTextFromVNodes(
    slots.default?.() ?? [],
  )
}

const defaultText = computed(() => {
  return extractBody()
})

const defaultUriName = computed(() => {
  return simplify(extractBody())
})
</script>

<template>
  <a
    :href="`/glossar/${props.name || defaultUriName}`"
    target="_blank"
    :title="`Link zum Glossar in neuem Tab für: ${defaultText}`"
  >
    <slot />
  </a>
</template>

<style scoped>
a {
  font-family: Ubuntu-Mono, monospace, serif;
  font-size: 0.95rem;
  border-radius: 0.3rem;
  padding: 0.2rem;
  border-style: dashed;
  border-width: 1pt;
  border-color: white;
}

a:hover {
  background-color: #F5F5F5;
  border-color: var(--color-primary);
}
</style>
