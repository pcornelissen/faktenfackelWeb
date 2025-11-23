<script setup lang="ts">
const route = useRoute()

const { data: page } = await useAsyncData(route.path, () => queryCollection('docs').path(route.path).first())
</script>

<template>
  <ContentRenderer :value="page" />
</template>
