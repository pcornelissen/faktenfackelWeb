<script setup lang="ts">
import Heading from '~/components/layout/Heading.vue'

const props = defineProps<{
  title: string
  subtitle?: string
  href?: string
  icon?: string
  nofollow?: boolean
  iconTxt?: string
}>()

// Todo: read iconTxt from .link files
</script>

<template>
  <div
    v-if="!href"
    class="section"
  >
    <Heading
      v-bind="props"
      class="mb-4"
    />
    <slot />
  </div>
  <a
    v-else
    class="display-block section clickable"
    :href="href"
    :rel="nofollow ? 'nofollow' : ''"
    style="text-decoration: none; color: inherit"
  >
    <Heading
      v-bind="props"
      class="mb-4"
    />
    <slot />
  </a>
</template>

<style scoped>
.section {
  display: inline-flex;
  flex: content;
  flex-direction: column;
  margin: 0.5rem;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 5px;
  max-width: 30%;
  min-width: 20rem;
  min-height: 12rem;
}

.clickable:hover {
  background-color: #F5F5F5;
  border: 1px dashed #e5e5e5;
  cursor: pointer;
}
</style>
