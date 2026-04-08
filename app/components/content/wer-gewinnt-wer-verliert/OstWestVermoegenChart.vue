<script setup lang="ts">
type MetricGroup = {
  label: string
  west: number
  ost: number
  unit: string
  format: (v: number) => string
}

const metrics: MetricGroup[] = [
  {
    label: 'Mittelwert Nettovermögen',
    west: 97000,
    ost: 48500,
    unit: 'euro',
    format: (v: number) => `${(v / 1000).toFixed(1).replace('.', ',')} Tsd. €`,
  },
  {
    label: 'Median Nettovermögen',
    west: 22500,
    ost: 8460,
    unit: 'euro',
    format: (v: number) => `${v.toLocaleString('de-DE')} €`,
  },
  {
    label: 'Eigentumsquote (Immobilien)',
    west: 43,
    ost: 32,
    unit: 'percent',
    format: (v: number) => `${v} %`,
  },
]

const chartWidth = 700
const chartHeight = 260
const padding = { top: 12, right: 110, bottom: 16, left: 200 }
const innerWidth = chartWidth - padding.left - padding.right
const innerHeight = chartHeight - padding.top - padding.bottom

const groupCount = metrics.length
const groupGap = 16
const pairGap = 3
const groupHeight = (innerHeight - groupGap * (groupCount - 1)) / groupCount
const barHeight = (groupHeight - pairGap) / 2

const maxByUnit: Record<string, number> = {
  euro: 100000,
  percent: 50,
}

const barWidthFor = (value: number, unit: string) =>
  (value / maxByUnit[unit]!) * innerWidth

const yForGroup = (index: number) => padding.top + index * (groupHeight + groupGap)
</script>

<template>
  <figure
    class="chart-figure"
    role="img"
    aria-label="Gruppiertes Balkendiagramm zum Ost-West-Vermögensvergleich. Durchschnittliches Nettovermögen: 97.000 Euro im Westen, 48.500 Euro im Osten. Medianvermögen: 22.500 Euro West, 8.460 Euro Ost."
  >
    <figcaption class="chart-figure__title">
      Ost-West-Vermögenslücke im verfügbaren Vergleichsjahr 2012
    </figcaption>

    <div class="chart-figure__legend">
      <span><i class="chart-figure__swatch chart-figure__swatch--west" />West</span>
      <span><i class="chart-figure__swatch chart-figure__swatch--ost" />Ost</span>
    </div>

    <svg
      class="chart-figure__svg"
      :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
      preserveAspectRatio="xMidYMid meet"
    >
      <g
        v-for="(metric, i) in metrics"
        :key="metric.label"
      >
        <text
          class="chart-figure__bar-label"
          :x="padding.left - 8"
          :y="yForGroup(i) + groupHeight / 2 + 4"
          text-anchor="end"
        >
          {{ metric.label }}
        </text>

        <!-- West bar -->
        <rect
          :x="padding.left"
          :y="yForGroup(i)"
          :width="barWidthFor(metric.west, metric.unit)"
          :height="barHeight"
          rx="2"
          class="chart-figure__bar chart-figure__bar--west"
        />
        <text
          class="chart-figure__value-label"
          :x="padding.left + barWidthFor(metric.west, metric.unit) + 6"
          :y="yForGroup(i) + barHeight / 2 + 4"
          text-anchor="start"
        >
          {{ metric.format(metric.west) }}
        </text>

        <!-- Ost bar -->
        <rect
          :x="padding.left"
          :y="yForGroup(i) + barHeight + pairGap"
          :width="barWidthFor(metric.ost, metric.unit)"
          :height="barHeight"
          rx="2"
          class="chart-figure__bar chart-figure__bar--ost"
        />
        <text
          class="chart-figure__value-label"
          :x="padding.left + barWidthFor(metric.ost, metric.unit) + 6"
          :y="yForGroup(i) + barHeight + pairGap + barHeight / 2 + 4"
          text-anchor="start"
        >
          {{ metric.format(metric.ost) }}
        </text>
      </g>
    </svg>

    <p class="chart-figure__note">
      Quelle: Bundeszentrale für politische Bildung, "Einkommen und Vermögen - wachsende Ungleichheiten", mit Vermögensdaten für 2012.
    </p>
  </figure>
</template>

<style scoped>
.chart-figure {
  max-width: 80ch;
  margin: 1.5rem 0;
  padding: 1rem;
  border: 1px solid var(--fackel-border);
  border-radius: 6px;
  background: #faf6f0;
}

.chart-figure__title {
  margin-bottom: 0.5rem;
  font-family: 'Playfair Display', 'Book Antiqua', Palatino, Georgia, serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ink);
}

.chart-figure__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
  margin-bottom: 0.85rem;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.78rem;
  color: var(--muted);
}

.chart-figure__legend span {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.chart-figure__swatch {
  display: inline-block;
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 2px;
}

.chart-figure__swatch--west {
  background: var(--flame);
}

.chart-figure__swatch--ost {
  background: var(--muted);
}

.chart-figure__svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.chart-figure__bar-label {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 11px;
  fill: var(--ink);
}

.chart-figure__bar--west {
  fill: var(--flame);
}

.chart-figure__bar--ost {
  fill: var(--muted);
}

.chart-figure__value-label {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  fill: var(--ink);
}

.chart-figure__note {
  margin: 0.75rem 0 0;
  font-size: 0.82rem;
  line-height: 1.55;
  color: var(--muted);
}
</style>
