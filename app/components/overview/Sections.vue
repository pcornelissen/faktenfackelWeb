<script setup lang="ts">
import SectionsItem from '~/components/overview/SectionsItem.vue'
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
        align-items: center;
        flex-wrap: wrap;
    }
</style>
