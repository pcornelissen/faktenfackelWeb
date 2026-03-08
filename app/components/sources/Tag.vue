<script setup lang="ts">
import { capitalize } from '~/utils/stringUtils'

const props = defineProps<{
  tag: string
}>()
</script>

<template>
  <NuxtLink
    :to="`/tags/${props.tag}`"
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
  white-space: nowrap;
  text-decoration: none;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}

.tag:hover {
  border-color: var(--flame);
  color: var(--flame);
  background-color: white;
}
</style>
