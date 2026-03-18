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
  display: flex;
  flex-direction: column;
  padding: 1.4rem 1.6rem;
  background: white;
  border-right: 1px solid var(--fackel-border);
  border-bottom: 1px solid var(--fackel-border);
  min-height: 12rem;
  position: relative;
  transition: background 0.2s;
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
  background: #FDFAF5;
}

.clickable:hover::before {
  transform: scaleX(1);
}
</style>
