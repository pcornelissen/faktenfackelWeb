<script setup lang="ts">
import { capitalize } from '~/utils/stringUtils'
import { useSlots } from 'vue'

const props = defineProps<{
  tags: string[]
}>()

const slots = useSlots()
</script>

<template>
  <div class="flex">
    <NuxtLink
      v-for="tag in props.tags"
      :key="tag"
      :to="`/quellen/tags/${tag}`"
      class="tag"
    >
      {{ capitalize(tag) }}
    </NuxtLink>
    <div
      v-if="slots.end"
      class="spacer"
    >
      <slot name="end" />
    </div>
  </div>
</template>

<style scoped>
.tag {
  font-size: 0.8rem;
  font-weight: 200;
  background-color: var(--color-tertiary);
  color: #fff;
  padding: 0.2rem 0.4rem;
  margin: 0.2rem 0.4rem;
  border-radius: 0.2rem;
}

.spacer {
  display: inline-flex;
  flex: 1;

  margin: 0.2rem 0.4rem;
  flex-direction: row-reverse;
}
</style>
