<script setup lang="ts">
type Country = {
  name: string
  rate: number
  highlight: boolean
}

const countries: Country[] = [
  { name: 'Bulgarien', rate: 26.84, highlight: false },
  { name: 'Rumänien', rate: 23.87, highlight: false },
  { name: 'Lettland', rate: 23.26, highlight: false },
  { name: 'Estland', rate: 21.23, highlight: false },
  { name: 'Zypern', rate: 19.99, highlight: false },
  { name: 'Deutschland', rate: 18.98, highlight: true },
  { name: 'Polen', rate: 18.96, highlight: false },
  { name: 'Niederlande', rate: 16.31, highlight: false },
  { name: 'Belgien', rate: 15.86, highlight: false },
  { name: 'Österreich', rate: 14.04, highlight: false },
  { name: 'Tschechien', rate: 13.78, highlight: false },
  { name: 'Frankreich', rate: 9.68, highlight: false },
  { name: 'Dänemark', rate: 9.7, highlight: false },
  { name: 'Finnland', rate: 6.49, highlight: false },
  { name: 'Schweden', rate: 4.05, highlight: false },
  { name: 'Portugal', rate: 1.77, highlight: false },
]

const euAverage = 14.7

const chartWidth = 700
const chartHeight = 500
const padding = { top: 12, right: 70, bottom: 16, left: 110 }
const innerWidth = chartWidth - padding.left - padding.right
const innerHeight = chartHeight - padding.top - padding.bottom

const barCount = countries.length
const barGap = 5
const barHeight = (innerHeight - barGap * (barCount - 1)) / barCount

const maxRate = 30

const xFor = (value: number) => padding.left + (value / maxRate) * innerWidth
const yFor = (index: number) => padding.top + index * (barHeight + barGap)
const barWidthFor = (value: number) => (value / maxRate) * innerWidth

const xTicks = [0, 5, 10, 15, 20, 25, 30]
</script>

<template>
  <figure
    class="chart-figure"
    role="img"
    aria-label="Horizontales Balkendiagramm der Niedriglohnquote im EU-Vergleich 2022. Deutschland liegt mit 18,98 Prozent über dem EU-Schnitt von 14,7 Prozent."
  >
    <figcaption class="chart-figure__title">
      Niedriglohnquote im EU-Vergleich
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
        {{ tick }} %
      </text>

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
        EU-Schnitt {{ String(euAverage).replace('.', ',') }}
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
          :width="barWidthFor(country.rate)"
          :height="barHeight"
          rx="2"
          :class="[
            'chart-figure__bar',
            country.highlight ? 'chart-figure__bar--highlight' : 'chart-figure__bar--default',
          ]"
        />

        <text
          class="chart-figure__value-label"
          :x="padding.left + barWidthFor(country.rate) + 6"
          :y="yFor(i) + barHeight / 2 + 4"
          text-anchor="start"
        >
          {{ country.rate.toFixed(1).replace('.', ',') }} %
        </text>
      </g>
    </svg>

    <p class="chart-figure__note">
      Quelle: Eurostat, Datensatz <a href="https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/earn_ses_pub1s" target="_blank" rel="noopener noreferrer"><code>earn_ses_pub1s</code></a>, Erhebungsjahr 2022. Niedriglohn = höchstens zwei Drittel des nationalen Median-Stundenlohns.
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
