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
        display: flex;
        justify-content: flex-start;
        flex-direction: row;
        flex-wrap: wrap;
    }
</style>
