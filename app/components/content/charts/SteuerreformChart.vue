<script setup lang="ts">
type TaxYear = {
  year: number
  koerperschaft: number
  spitzensteuersatz: number
  abgeltung: number | null
}

const data: TaxYear[] = [
  { year: 1998, koerperschaft: 45, spitzensteuersatz: 53, abgeltung: null },
  { year: 2001, koerperschaft: 25, spitzensteuersatz: 48.5, abgeltung: null },
  { year: 2008, koerperschaft: 15, spitzensteuersatz: 45, abgeltung: null },
  { year: 2009, koerperschaft: 15, spitzensteuersatz: 45, abgeltung: 25 },
  { year: 2024, koerperschaft: 15, spitzensteuersatz: 45, abgeltung: 25 },
]

const chartWidth = 700
const chartHeight = 320
const padding = { top: 20, right: 16, bottom: 60, left: 48 }
const innerWidth = chartWidth - padding.left - padding.right
const innerHeight = chartHeight - padding.top - padding.bottom

const minYear = 1998
const maxYear = 2024

const xFor = (year: number) =>
  padding.left + ((year - minYear) / (maxYear - minYear)) * innerWidth

const yFor = (value: number) =>
  padding.top + innerHeight - (value / 60) * innerHeight

const yTicks = [0, 10, 20, 30, 40, 50, 60]

const linePath = (accessor: (d: TaxYear) => number | null) => {
  const filtered = data.filter(d => accessor(d) !== null)
  return filtered
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xFor(d.year)} ${yFor(accessor(d) as number)}`)
    .join(' ')
}

const arbeitPath = linePath(d => d.spitzensteuersatz)
const koerperschaftPath = linePath(d => d.koerperschaft)
const abgeltungPath = linePath(d => d.abgeltung)
</script>

<template>
  <figure
    class="chart-figure"
    role="img"
    aria-label="Liniendiagramm zu zentralen Steuertarifen in Deutschland seit 1998. Gezeigt werden Spitzensteuersatz, Körperschaftsteuer und ab 2009 die Abgeltungsteuer."
  >
    <figcaption class="chart-figure__title">
      Zentrale Steuertarife seit 1998
    </figcaption>

    <div class="chart-figure__legend">
      <span><i class="chart-figure__swatch chart-figure__swatch--arbeit" />Spitzensteuersatz Arbeit</span>
      <span><i class="chart-figure__swatch chart-figure__swatch--koerperschaft" />Körperschaftsteuer</span>
      <span><i class="chart-figure__swatch chart-figure__swatch--abgeltung" />Abgeltungsteuer Kapital</span>
    </div>

    <svg
      class="chart-figure__svg"
      :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
      preserveAspectRatio="xMidYMid meet"
    >
      <line
        v-for="tick in yTicks"
        :key="`grid-${tick}`"
        class="chart-figure__grid"
        :x1="padding.left"
        :x2="chartWidth - padding.right"
        :y1="yFor(tick)"
        :y2="yFor(tick)"
      />

      <text
        v-for="tick in yTicks"
        :key="`y-label-${tick}`"
        class="chart-figure__axis-label"
        :x="padding.left - 10"
        :y="yFor(tick) + 4"
        text-anchor="end"
      >
        {{ tick }} %
      </text>

      <text
        v-for="d in data"
        :key="`x-label-${d.year}`"
        class="chart-figure__axis-label"
        :x="xFor(d.year)"
        :y="chartHeight - padding.bottom + 20"
        text-anchor="middle"
      >
        {{ d.year }}
      </text>

      <!-- Lines -->
      <path
        :d="arbeitPath"
        class="chart-figure__line chart-figure__line--arbeit"
      />
      <path
        :d="koerperschaftPath"
        class="chart-figure__line chart-figure__line--koerperschaft"
      />
      <path
        :d="abgeltungPath"
        class="chart-figure__line chart-figure__line--abgeltung"
      />

      <!-- Dots -->
      <circle
        v-for="d in data"
        :key="`dot-arbeit-${d.year}`"
        class="chart-figure__dot chart-figure__dot--arbeit"
        :cx="xFor(d.year)"
        :cy="yFor(d.spitzensteuersatz)"
        r="4"
      />
      <circle
        v-for="d in data"
        :key="`dot-koerperschaft-${d.year}`"
        class="chart-figure__dot chart-figure__dot--koerperschaft"
        :cx="xFor(d.year)"
        :cy="yFor(d.koerperschaft)"
        r="4"
      />
      <template
        v-for="d in data"
        :key="`dot-abgeltung-${d.year}`"
      >
        <circle
          v-if="d.abgeltung !== null"
          class="chart-figure__dot chart-figure__dot--abgeltung"
          :cx="xFor(d.year)"
          :cy="yFor(d.abgeltung)"
          r="4"
        />
      </template>

      <!-- Value labels at last point -->
      <text
        class="chart-figure__series-end"
        :x="xFor(2024) + 8"
        :y="yFor(45) + 4"
      >
        45 %
      </text>
      <text
        class="chart-figure__series-end"
        :x="xFor(2024) + 8"
        :y="yFor(25) + 4"
      >
        25 %
      </text>
      <text
        class="chart-figure__series-end"
        :x="xFor(2024) + 8"
        :y="yFor(15) + 4"
      >
        15 %
      </text>
    </svg>

    <p class="chart-figure__note">
      Quelle: Einkommensteuergesetz, Körperschaftsteuergesetz (eigene Zusammenstellung).
      Gezeigt werden gesetzliche Tarifsätze, nicht die gesamte effektive Abgabenlast. Körperschaftsteuer ohne Solidaritätszuschlag und Gewerbesteuer. Ab 2009: Abgeltungsteuer auf Kapitalerträge.
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

.chart-figure__swatch--arbeit {
  background: var(--flame);
}

.chart-figure__swatch--koerperschaft {
  background: var(--fackel-border);
}

.chart-figure__swatch--abgeltung {
  background: var(--muted);
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

.chart-figure__line {
  fill: none;
  stroke-width: 2.5;
}

.chart-figure__line--arbeit {
  stroke: var(--flame);
}

.chart-figure__line--koerperschaft {
  stroke: var(--fackel-border);
}

.chart-figure__line--abgeltung {
  stroke: var(--muted);
  stroke-dasharray: 6 4;
}

.chart-figure__dot--arbeit {
  fill: var(--flame);
}

.chart-figure__dot--koerperschaft {
  fill: var(--fackel-border);
}

.chart-figure__dot--abgeltung {
  fill: var(--muted);
}

.chart-figure__series-end {
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
