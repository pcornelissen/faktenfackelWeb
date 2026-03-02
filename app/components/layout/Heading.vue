<script setup lang="ts">
const props = defineProps<{
  title: string
  subtitle?: string
  icon?: string
  iconTxt?: string
}>()
</script>

<template>
  <div class="flex">
    <div
      v-if="props.icon"
      class="shrink-0 mr-2"
    >
      <img
        :src="`/img/categories/${props.icon}.png`"
        :alt="`Bild für ${title}`"
        :title="props.iconTxt"
      >
    </div>
    <div class="flex-auto">
      <h2>{{ props.title }}</h2>
      <div
        v-if="props.subtitle"
        class="subtitle"
      >
        {{ props.subtitle }}
      </div>
      <div
        v-else
        class="subtitle"
      >
        &nbsp;
      </div>
    </div>
  </div>
</template>

<style scoped>
  h2 {
    margin: 0.4rem 0 0.2rem;
    font-size: 1.2rem;
  }

  img {
    height: 2.5rem;
    opacity: 0.9;
  }

  .subtitle {
    font-size: 0.82rem;
    color: var(--muted);
    margin-bottom: 0.5rem;
    font-family: 'Ubuntu Mono', monospace;
    letter-spacing: 0.04em;
  }
</style>
