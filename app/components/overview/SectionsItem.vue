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
  padding: 1.5rem 1.5rem 1.35rem;
  background: white;
  border: 1px solid var(--fackel-border);
  border-radius: 1.1rem;
  min-height: 12rem;
  position: relative;
  transition: background 0.2s, transform 0.2s, border-color 0.2s, box-shadow 0.2s;
  box-shadow: 0 10px 26px rgba(31, 22, 15, 0.04);
}

.section::before {
  content: '';
  position: absolute;
  top: 0.9rem;
  left: 1.5rem;
  width: 2rem;
  height: 2px;
  background: var(--flame);
  opacity: 0.8;
}

.clickable {
  cursor: pointer;
}

.clickable:hover {
  background: #FDFAF5;
  transform: translateY(-2px);
  border-color: #E6C6A7;
  box-shadow: 0 16px 36px rgba(31, 22, 15, 0.08);
}
</style>
