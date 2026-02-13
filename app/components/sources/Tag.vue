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
  font-size: 0.8rem;
  font-weight: 200;
  background-color: var(--color-tertiary);
  color: var(--text-color);
  padding: 0.2rem 0.4rem;
  margin: 0.2rem 0.4rem;
  border-radius: 0.2rem;
  transition: ease all .5s;
}

.tag:hover {
  color: #fff;
  transition: ease all .5s;
}
</style>
