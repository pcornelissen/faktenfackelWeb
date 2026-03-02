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
  padding: 1.4rem 1.6rem;
  background: white;
  border: 1px solid var(--fackel-border);
  border-radius: 6px;
  max-width: 30%;
  min-width: 20rem;
  min-height: 12rem;
  position: relative;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.section::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--flame);
  border-radius: 6px 6px 0 0;
  transform: scaleX(0);
  transition: transform 0.25s;
  transform-origin: left;
}

.clickable {
  cursor: pointer;
}

.clickable:hover {
  border-color: var(--flame);
  box-shadow: 0 4px 16px rgba(249, 140, 53, 0.12);
}

.clickable:hover::before {
  transform: scaleX(1);
}
</style>
