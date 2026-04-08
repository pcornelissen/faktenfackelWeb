<script setup lang="ts">
type Country = {
  name: string
  price: number
  highlight: boolean
}

const countries: Country[] = [
  { name: 'Deutschland', price: 38.35, highlight: true },
  { name: 'Belgien', price: 35.71, highlight: false },
  { name: 'Niederlande', price: 34.98, highlight: false },
  { name: 'Dänemark', price: 34.85, highlight: false },
  { name: 'Tschechien', price: 27.43, highlight: false },
  { name: 'Österreich', price: 26.82, highlight: false },
  { name: 'Italien', price: 26.40, highlight: false },
  { name: 'Frankreich', price: 25.13, highlight: false },
  { name: 'Spanien', price: 22.85, highlight: false },
  { name: 'Schweden', price: 22.17, highlight: false },
  { name: 'Polen', price: 19.84, highlight: false },
  { name: 'Finnland', price: 17.63, highlight: false },
  { name: 'Ungarn', price: 10.40, highlight: false },
]

const euAverage = 28.72

const chartWidth = 700
const chartHeight = 420
const padding = { top: 12, right: 70, bottom: 16, left: 110 }
const innerWidth = chartWidth - padding.left - padding.right
const innerHeight = chartHeight - padding.top - padding.bottom

const barCount = countries.length
const barGap = 5
const barHeight = (innerHeight - barGap * (barCount - 1)) / barCount

const maxPrice = 42

const xFor = (value: number) => padding.left + (value / maxPrice) * innerWidth
const yFor = (index: number) => padding.top + index * (barHeight + barGap)
const barWidthFor = (value: number) => (value / maxPrice) * innerWidth

const xTicks = [0, 10, 20, 30, 40]
</script>

<template>
  <figure
    class="chart-figure"
    role="img"
    aria-label="Horizontales Balkendiagramm der Haushaltsstrompreise in der EU im ersten Halbjahr 2025. Deutschland liegt mit 38,35 Cent pro Kilowattstunde an der Spitze, deutlich über dem EU-Schnitt von 28,72 Cent."
  >
    <figcaption class="chart-figure__title">
      Haushaltsstrompreise in der EU: H1 2025 (Ct/kWh)
    </figcaption>

    <svg
      class="chart-figure__svg"
      :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
      preserveAspectRatio="xMidYMid meet"
    >
      <!-- Grid lines -->
      <line
        v-for="tick in xTicks"
        :key="`grid-${tick}`"
        class="chart-figure__grid"
        :x1="xFor(tick)"
        :x2="xFor(tick)"
        :y1="padding.top - 4"
        :y2="chartHeight - padding.bottom"
      />

      <text
        v-for="tick in xTicks"
        :key="`tick-${tick}`"
        class="chart-figure__axis-label"
        :x="xFor(tick)"
        :y="chartHeight - padding.bottom + 14"
        text-anchor="middle"
      >
        {{ tick }}
      </text>

      <!-- EU average reference line -->
      <line
        class="chart-figure__ref-line"
        :x1="xFor(euAverage)"
        :x2="xFor(euAverage)"
        :y1="padding.top - 4"
        :y2="chartHeight - padding.bottom"
      />
      <text
        class="chart-figure__ref-label"
        :x="xFor(euAverage) + 4"
        :y="padding.top + 6"
      >
        EU-Schnitt {{ euAverage.toFixed(2).replace('.', ',') }}
      </text>

      <!-- Bars -->
      <g
        v-for="(country, i) in countries"
        :key="country.name"
      >
        <text
          class="chart-figure__bar-label"
          :x="padding.left - 8"
          :y="yFor(i) + barHeight / 2 + 4"
          text-anchor="end"
        >
          {{ country.name }}
        </text>

        <rect
          :x="padding.left"
          :y="yFor(i)"
          :width="barWidthFor(country.price)"
          :height="barHeight"
          rx="2"
          :class="[
            'chart-figure__bar',
            country.highlight ? 'chart-figure__bar--highlight' : 'chart-figure__bar--default',
          ]"
        />

        <text
          class="chart-figure__value-label"
          :x="padding.left + barWidthFor(country.price) + 6"
          :y="yFor(i) + barHeight / 2 + 4"
          text-anchor="start"
        >
          {{ country.price.toFixed(2).replace('.', ',') }}
        </text>
      </g>
    </svg>

    <p class="chart-figure__note">
      Quelle: Eurostat / Strom-Report, H1 2025, inkl. Steuern und Abgaben
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
  margin-bottom: 0.75rem;
  font-family: 'Playfair Display', 'Book Antiqua', Palatino, Georgia, serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ink);
}

.chart-figure__svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.chart-figure__grid {
  stroke: var(--fackel-border);
  stroke-width: 1;
}

.chart-figure__axis-label {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 11px;
  fill: var(--muted);
}

.chart-figure__ref-line {
  stroke: var(--flame);
  stroke-width: 2;
  stroke-dasharray: 6 4;
}

.chart-figure__ref-label {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  fill: var(--flame);
}

.chart-figure__bar-label {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 12px;
  fill: var(--ink);
}

.chart-figure__bar--highlight {
  fill: var(--ember);
}

.chart-figure__bar--default {
  fill: var(--fackel-border);
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
