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
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1rem;
  margin: 0.75rem 0;
}
</style>
