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
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.74rem;
  font-weight: 600;
  background-color: white;
  color: var(--muted);
  border: 1px solid var(--fackel-border);
  padding: 0.38rem 0.62rem;
  margin: 0.22rem 0.34rem 0.22rem 0;
  border-radius: 999px;
  white-space: nowrap;
  text-decoration: none;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.tag:hover {
  border-color: var(--flame);
  color: var(--flame);
  background-color: white;
}
</style>
