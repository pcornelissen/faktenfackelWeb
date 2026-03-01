<script setup lang="ts">
import { capitalize } from '~/utils/stringUtils'

const props = defineProps<{
  tag: string
  basePath: string
}>()
</script>

<template>
  <NuxtLink
    :to="`${props.basePath}/tags/${props.tag}`"
    class="tag"
  >
    {{ capitalize(tag) }}
  </NuxtLink>
</template>

<style scoped>
.tag {
  font-size: 0.78rem;
  font-weight: 500;
  background-color: white;
  color: var(--muted);
  border: 1px solid var(--fackel-border);
  padding: 0.2rem 0.5rem;
  margin: 0.2rem 0.3rem;
  border-radius: 0.2rem;
  text-decoration: none;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}

.tag:hover {
  border-color: var(--ember);
  color: var(--ember);
  background-color: white;
}
</style>
