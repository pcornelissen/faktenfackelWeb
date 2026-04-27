<template>
  <p class="verdict-scale-link">
    <NuxtLink
      to="/bewertungsmasstab/"
      aria-label="Bewertungsmaßstab für Faktenfackel-Urteile öffnen"
    >
      Wie kommt dieses Urteil zustande?
    </NuxtLink>
  </p>
</template>

<style scoped>
.verdict-scale-link {
  margin: -0.35rem 0 0.95rem;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.82rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.verdict-scale-link a {
  color: var(--muted);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.verdict-scale-link a:hover {
  color: var(--flame);
}
</style>
