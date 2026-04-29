<script setup lang="ts">
</script>

<template>
  <div class="container">
    <slot name="start" />
    <slot />
    <slot name="end" />
  </div>
</template>

<style scoped>
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr));
  gap: 1rem;
  margin: 0.75rem 0;
  width: 100%;
  min-width: 0;
}
</style>
