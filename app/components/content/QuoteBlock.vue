<script setup lang="ts">
const props = defineProps<{
  name?: string
  src?: string
}>()
</script>

<template>
  <blockquote class="border-s-4 border-accented ps-4 italic">
    <cite v-if="!props.src && props.name">{{ props.name }}</cite>
    <cite v-if="props.src && props.name"><a :href="props.src">{{ props.name }}</a></cite>
    <slot />
  </blockquote>
</template>

<style scoped>
@reference "@/assets/css/main.css";

cite {
  display: block;
  font-weight: bold;
}
blockquote {
  @apply border-s-4;
  @apply border-accented;
  @apply ps-4;
  @apply italic;
}
</style>
