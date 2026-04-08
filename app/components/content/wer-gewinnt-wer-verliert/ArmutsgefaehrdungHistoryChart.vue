<script setup lang="ts">
type PovertyPoint = {
  year: number
  germany: number
  eu?: number
}

const points: PovertyPoint[] = [
  { year: 2010, germany: 15.6, eu: 16.5 },
  { year: 2011, germany: 15.8, eu: 16.9 },
  { year: 2012, germany: 16.1, eu: 16.9 },
  { year: 2013, germany: 16.1, eu: 16.8 },
  { year: 2014, germany: 16.7, eu: 17.3 },
  { year: 2015, germany: 16.7, eu: 17.4 },
  { year: 2016, germany: 16.5, eu: 17.5 },
  { year: 2017, germany: 16.1, eu: 16.9 },
  { year: 2018, germany: 16.0, eu: 16.8 },
  { year: 2019, germany: 14.8, eu: 16.5 },
  { year: 2020, germany: 16.1, eu: 16.7 },
  { year: 2021, germany: 16.0, eu: 16.8 },
  { year: 2022, germany: 14.8, eu: 16.5 },
  { year: 2023, germany: 14.4, eu: 16.2 },
  { year: 2024, germany: 15.5, eu: 16.2 },
  { year: 2025, germany: 16.1 },
]

const chartWidth = 760
const chartHeight = 320
const padding = {
  top: 18,
  right: 18,
  bottom: 42,
  left: 44,
}

const firstPoint = points[0]
const lastPoint = points.at(-1)

if (!firstPoint || !lastPoint) {
  throw new Error('ArmutsgefaehrdungHistoryChart requires at least one data point.')
}

const minYear = firstPoint.year
const maxYear = lastPoint.year
const minRate = 0
const maxRate = 20
const innerWidth = chartWidth - padding.left - padding.right
const innerHeight = chartHeight - padding.top - padding.bottom
const xTicks = [2010, 2013, 2016, 2019, 2022, 2025]
const yTicks = [0, 5, 10, 15, 20]

const xFor = (year: number) =>
  padding.left + ((year - minYear) / (maxYear - minYear)) * innerWidth

const yFor = (rate: number) =>
  padding.top + innerHeight - ((rate - minRate) / (maxRate - minRate)) * innerHeight

const linePath = (selector: (point: PovertyPoint) => number | undefined) =>
  points
    .filter(point => typeof selector(point) === 'number')
    .map((point, index) => {
      const value = selector(point)

      if (typeof value !== 'number') {
        return ''
      }

      return `${index === 0 ? 'M' : 'L'} ${xFor(point.year)} ${yFor(value)}`
    })
    .join(' ')
</script>

<template>
  <figure
    class="chart-figure"
    role="img"
    aria-label="Liniengrafik zur Armutsgefährdungsquote nach EU-SILC in Deutschland und im EU-Durchschnitt von 2010 bis 2025"
  >
    <figcaption class="chart-figure__title">
      Armutsgefährdungsquote seit 2010
    </figcaption>

    <div class="chart-figure__legend">
      <span><i class="chart-figure__swatch chart-figure__swatch--germany" />Deutschland</span>
      <span><i class="chart-figure__swatch chart-figure__swatch--eu" />EU-Schnitt</span>
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
        :key="`ylabel-${tick}`"
        class="chart-figure__axis-label"
        :x="padding.left - 8"
        :y="yFor(tick) + 4"
        text-anchor="end"
      >
        {{ String(tick).replace('.', ',') }} %
      </text>

      <text
        v-for="tick in xTicks"
        :key="`xlabel-${tick}`"
        class="chart-figure__axis-label"
        :x="xFor(tick)"
        :y="chartHeight - padding.bottom + 22"
        text-anchor="middle"
      >
        {{ tick }}
      </text>

      <path
        :d="linePath(point => point.eu)"
        class="chart-figure__line chart-figure__line--eu"
      />
      <path
        :d="linePath(point => point.germany)"
        class="chart-figure__line chart-figure__line--germany"
      />

      <circle
        v-for="point in points.filter(point => typeof point.eu === 'number')"
        :key="`eu-${point.year}`"
        class="chart-figure__point chart-figure__point--eu"
        :cx="xFor(point.year)"
        :cy="yFor(point.eu!)"
        r="3"
      />
      <circle
        v-for="point in points"
        :key="`de-${point.year}`"
        class="chart-figure__point chart-figure__point--germany"
        :cx="xFor(point.year)"
        :cy="yFor(point.germany)"
        r="3.5"
      />

      <text
        class="chart-figure__series-label chart-figure__series-label--eu"
        :x="xFor(2024) - 6"
        :y="yFor(16.2) - 8"
        text-anchor="end"
      >
        EU 2024: 16,2 %
      </text>
      <text
        class="chart-figure__series-label chart-figure__series-label--germany"
        :x="xFor(2025) - 6"
        :y="yFor(16.1) - 8"
        text-anchor="end"
      >
        Deutschland 2025: 16,1 %
      </text>
    </svg>

    <p class="chart-figure__note">
      Quelle:
      <a
        href="https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/tessi010?geo=DE&geo=EU27_2020&sex=T"
        target="_blank"
        rel="noopener noreferrer"
      >Eurostat-Datensatz tessi010</a>
      zur Armutsgefährdungsquote nach EU-SILC. Die Deutschland-Linie reicht bis 2025, der EU-Schnitt ist derzeit bis 2024 verfügbar.
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
  gap: 0.85rem 1.2rem;
  margin: 0 0 0.75rem;
  font-size: 0.85rem;
  color: var(--muted);
}

.chart-figure__legend span {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.chart-figure__swatch {
  width: 1rem;
  height: 0.25rem;
  border-radius: 999px;
}

.chart-figure__swatch--germany {
  background: var(--ember);
}

.chart-figure__swatch--eu {
  background: #7f766a;
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
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.chart-figure__line--germany {
  stroke: var(--ember);
}

.chart-figure__line--eu {
  stroke: #7f766a;
}

.chart-figure__point {
  stroke: #faf6f0;
  stroke-width: 2;
}

.chart-figure__point--germany {
  fill: var(--ember);
}

.chart-figure__point--eu {
  fill: #7f766a;
}

.chart-figure__series-label {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 10px;
  font-weight: 700;
}

.chart-figure__series-label--germany {
  fill: var(--ember);
}

.chart-figure__series-label--eu {
  fill: #7f766a;
}

.chart-figure__note {
  margin: 0.75rem 0 0;
  font-size: 0.82rem;
  line-height: 1.55;
  color: var(--muted);
}
</style>
