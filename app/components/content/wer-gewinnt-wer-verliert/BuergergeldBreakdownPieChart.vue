<script setup lang="ts">
type Slice = {
  label: string
  value: number
  color: string
}

// Gesamtzahl erwerbsfähiger Leistungsberechtigter (BfA Methodenbericht, Dezember 2023)
const totalPersons = 4_021_000

const slices: Slice[] = [
  { label: 'Arbeitslos', value: 43.0, color: '#B53A10' },
  { label: 'Arbeitsmarktpolitische Maßnahmen', value: 13.9, color: '#D85B1F' },
  { label: 'Erwerbstätig', value: 10.2, color: '#F08D42' },
  { label: 'Schule, Studium, Ausbildung', value: 10.4, color: '#F6B36A' },
  { label: 'Erziehung, Haushalt, Pflege', value: 7.0, color: '#F9C88F' },
  { label: 'Arbeitsunfähig', value: 6.0, color: '#D9D0C2' },
  { label: 'Sonderregelungen für Ältere', value: 2.6, color: '#B9AE9A' },
  { label: 'Sonstiges oder unbekannt', value: 7.0, color: '#8A7D6A' },
]

function formatAbsolute(percent: number): string {
  const n = Math.round((percent / 100) * totalPersons)
  if (n >= 1_000_000) {
    return `ca. ${(n / 1_000_000).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Mio.`
  }
  return `ca. ${n.toLocaleString('de-DE')} Pers.`
}

const radius = 72
const circumference = 2 * Math.PI * radius

let offset = 0
const arcs = slices.map((slice) => {
  const length = (slice.value / 100) * circumference
  const current = {
    ...slice,
    dasharray: `${length} ${circumference - length}`,
    dashoffset: -offset,
  }
  offset += length
  return current
})
</script>

<template>
  <figure class="buergergeld-pie">
    <figcaption class="buergergeld-pie__title">
      Bürgergeld ist nicht gleich Arbeitslosigkeit
    </figcaption>

    <div class="buergergeld-pie__layout">
      <svg
        class="buergergeld-pie__svg"
        viewBox="0 0 220 220"
        role="img"
        aria-label="Kreisdiagramm zur Aufteilung erwerbsfähiger Leistungsberechtigter im Bürgergeld nach Arbeitsstatus und Lebenslage"
      >
        <g transform="translate(110 110) rotate(-90)">
          <circle
            class="buergergeld-pie__track"
            :r="radius"
            cx="0"
            cy="0"
          />
          <circle
            v-for="arc in arcs"
            :key="arc.label"
            class="buergergeld-pie__slice"
            :r="radius"
            cx="0"
            cy="0"
            :stroke="arc.color"
            :stroke-dasharray="arc.dasharray"
            :stroke-dashoffset="arc.dashoffset"
          />
        </g>

        <text
          x="110"
          y="100"
          text-anchor="middle"
          class="buergergeld-pie__center-value"
        >
          43 %
        </text>
        <text
          x="110"
          y="122"
          text-anchor="middle"
          class="buergergeld-pie__center-label"
        >
          arbeitslos
        </text>
      </svg>

      <div class="buergergeld-pie__legend">
        <div
          v-for="slice in slices"
          :key="slice.label"
          class="buergergeld-pie__legend-item"
        >
          <span
            class="buergergeld-pie__swatch"
            :style="{ backgroundColor: slice.color }"
          />
          <span class="buergergeld-pie__legend-label">{{ slice.label }}</span>
          <span class="buergergeld-pie__legend-values">
            <span class="buergergeld-pie__legend-pct">{{ String(slice.value).replace('.', ',') }}&thinsp;%</span>
            <span class="buergergeld-pie__legend-abs">{{ formatAbsolute(slice.value) }}</span>
          </span>
        </div>
      </div>
    </div>

    <p class="buergergeld-pie__note">
      Quelle:
      <a
        href="https://statistik.arbeitsagentur.de/DE/Statischer-Content/Grundlagen/Methodik-Qualitaet/Methodenberichte/Grundsicherung-Arbeitsuchende-SGBII/Generische-Publikationen/Methodenbericht-Warum-sind-nicht-alle-ELB-arbeitslos-2024.pdf"
        target="_blank"
        rel="noopener noreferrer"
      >Bundesagentur für Arbeit, Methodenbericht "Warum sind nicht alle erwerbsfähigen Leistungsberechtigten arbeitslos?" (Ausgabe 2024)</a>,
      Tabelle A1, Deutschland, Dezember 2023.
    </p>

    <p class="buergergeld-pie__note">
      Gezeigt werden Anteile an allen erwerbsfähigen Leistungsberechtigten im Bürgergeld, nicht nur an den nicht arbeitslosen Personen.
    </p>
  </figure>
</template>

<style scoped>
.buergergeld-pie {
  max-width: 80ch;
  margin: 1.4rem 0;
  padding: 1rem;
  border: 1px solid var(--fackel-border);
  border-radius: 6px;
  background: #faf6f0;
}

.buergergeld-pie__title {
  margin-bottom: 0.75rem;
  font-family: 'Playfair Display', 'Book Antiqua', Palatino, Georgia, serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ink);
}

.buergergeld-pie__layout {
  display: grid;
  gap: 1rem;
  align-items: center;
}

@media (min-width: 720px) {
  .buergergeld-pie__layout {
    grid-template-columns: 220px minmax(0, 1fr);
  }
}

.buergergeld-pie__svg {
  width: 100%;
  max-width: 220px;
  height: auto;
}

.buergergeld-pie__track,
.buergergeld-pie__slice {
  fill: none;
  stroke-width: 34;
}

.buergergeld-pie__track {
  stroke: #eee7dc;
}

.buergergeld-pie__center-value,
.buergergeld-pie__center-label,
.buergergeld-pie__legend-value {
  font-family: 'Ubuntu Mono', monospace;
}

.buergergeld-pie__center-value {
  font-size: 1.1rem;
  font-weight: 700;
  fill: var(--smoke);
}

.buergergeld-pie__center-label {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  fill: var(--muted);
}

.buergergeld-pie__legend {
  display: grid;
  gap: 0.45rem;
}

.buergergeld-pie__legend-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.95rem;
  line-height: 1.35;
}

.buergergeld-pie__swatch {
  width: 0.85rem;
  height: 0.85rem;
  border-radius: 2px;
}

.buergergeld-pie__legend-label {
  min-width: 0;
}

.buergergeld-pie__legend-values {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.1rem;
  white-space: nowrap;
}

.buergergeld-pie__legend-pct {
  color: var(--ink);
  font-family: 'Ubuntu Mono', monospace;
  font-weight: 600;
}

.buergergeld-pie__legend-abs {
  color: var(--muted);
  font-size: 0.8rem;
  font-family: 'Ubuntu Mono', monospace;
}

.buergergeld-pie__note {
  margin: 0.8rem 0 0;
  font-size: 0.88rem;
  line-height: 1.55;
  color: var(--muted);
}
</style>
