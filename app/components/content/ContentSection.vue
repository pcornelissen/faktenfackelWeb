<script setup lang="ts">
defineProps<{
  icon: string
  title: string
}>()
</script>

<template>
  <section>
    <h2 class="section-title">
      <Icon
        :name="icon"
        class="section-icon"
      />
      {{ title }}
    </h2>
    <slot />
  </section>
</template>

<style scoped>
.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ink);
  margin: 0 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--fackel-border);
}

.section-icon {
  color: var(--flame);
  font-size: 1rem;
}
</style>
