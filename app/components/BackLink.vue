<script setup lang="ts">
defineProps<{ to: string }>()
</script>

<template>
  <NuxtLink
    :to="to"
    class="back-link"
  >
    <span
      class="back-arrow"
      aria-hidden="true"
    />
    <slot />
  </NuxtLink>
</template>

<style scoped>
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  text-decoration: none;
  margin-bottom: 1.75rem;
  padding: 5px 10px 5px 8px;
  border: 1px solid var(--fackel-border);
  border-radius: 3px;
  background: white;
  transition: color 0.15s, border-color 0.15s;
}

.back-link:hover {
  color: var(--flame);
  border-color: var(--flame);
}

.back-arrow {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-left: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: rotate(45deg);
  flex-shrink: 0;
  transition: transform 0.15s;
}

.back-link:hover .back-arrow {
  transform: rotate(45deg) translate(-2px, 2px);
}
</style>
