<template>
  <aside class="correction-notice">
    <div class="correction-notice__label">
      Hinweise und Korrekturen
    </div>
    <p class="correction-notice__text">
      Du hast einen Fehler gefunden, eine bessere Quelle oder wichtigen Kontext? Melde dich bitte über die
      <NuxtLink to="/kontakt/">
        Kontaktseite
      </NuxtLink>. Korrekturen werden nachvollziehbar geprüft und bei Bedarf im Artikelstand sichtbar.
    </p>
  </aside>
</template>

<style scoped>
.correction-notice {
  margin-top: 2.2rem;
  padding: 1rem 1.15rem;
  border: 1px solid color-mix(in srgb, var(--flame) 22%, var(--fackel-border));
  border-top: 2px solid color-mix(in srgb, var(--flame) 55%, var(--fackel-border));
  border-radius: 0.75rem;
  background: #FCF7F0;
}

.correction-notice__label {
  margin-bottom: 0.4rem;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--flame);
}

.correction-notice__text {
  margin: 0;
  color: var(--muted);
  line-height: 1.55;
}
</style>
