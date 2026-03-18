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
  gap: 0;
  border: 1px solid var(--fackel-border);
  border-radius: 6px;
  overflow: hidden;
  margin: 0.5rem 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}
</style>
