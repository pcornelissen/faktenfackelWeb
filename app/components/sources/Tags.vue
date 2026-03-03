<script setup lang="ts">
import { useSlots } from 'vue'
import Tag from '~/components/sources/Tag.vue'

const props = defineProps<{
  tags: string[]
}>()

const slots = useSlots()
</script>

<template>
  <div class="flex">
    <Tag
      v-for="tag in props.tags"
      :key="tag"
      :tag="tag"
    />
    <div
      v-if="slots.end"
      class="spacer"
    >
      <slot name="end" />
    </div>
  </div>
</template>

<style scoped>
.spacer {
  display: inline-flex;
  flex: 1;

  margin: 0.2rem 0.4rem;
  flex-direction: row-reverse;
}
</style>
