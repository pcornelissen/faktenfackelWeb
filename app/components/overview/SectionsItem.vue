<script setup lang="ts">
import Heading from '~/components/layout/Heading.vue'

const props = defineProps<{
  title: string
  subtitle?: string
  href?: string
  icon?: string
  iconTxt?: string
}>()

// Todo: read iconTxt from .link files

function click() {
  const href = props.href
  if (href) {
    window.location.href = href
  }
}
</script>

<template>
  <div
    :class="[href ? 'clickable' : '']"
    class="section"
    @click="click"
  >
    <Heading
      v-bind="props"
      class="mb-4"
    />
    <slot />
  </div>
</template>

<style scoped>
.section {
  display: inline-flex;
  flex: content;
  flex-direction: column;
  margin: 0.5rem;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  max-width: 30%;
  min-width: 20rem;
  min-height: 15rem;
}

.clickable:hover {
  background-color: #F5F5F5;
  border: 1px dot-dash #d5d5d5;
  cursor: pointer;
}
</style>
