<template>
  <div class="example-box">
    <span class="example-label">Beispiel</span>
    <slot />
  </div>
</template>

<style scoped>
.example-box {
  border: 1px solid var(--fackel-border);
  border-radius: 6px;
  padding: 0.5rem 1rem;
  margin: 0.5rem 0;
  background: var(--paper);
}

.example-label {
  display: block;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 0.25rem;
}

.example-box :deep(p:first-of-type) {
  margin-top: 0;
}

.example-box :deep(p:last-of-type) {
  margin-bottom: 0;
}
</style>
