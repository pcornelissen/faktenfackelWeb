<script setup lang="ts">
type Series = {
  key: string
  label: string
  color: string
  values: DataPoint[]
}

type DataPoint = {
  year: number
  value: number
}

const chartWidth = 720
const chartHeight = 300
const padding = { top: 28, right: 72, bottom: 42, left: 64 }
const innerWidth = chartWidth - padding.left - padding.right
const innerHeight = chartHeight - padding.top - padding.bottom
const minValue = 70
const maxValue = 170
const startYear = 2000
const endYear = 2023
const yearTicks = [2000, 2005, 2010, 2015, 2020, 2023]

const series: Series[] = [
  {
    key: 'vpi',
    label: 'Verbraucherpreise',
    color: '#78716C',
    values: [
      { year: 2000, value: 75.5 },
      { year: 2001, value: 77.0 },
      { year: 2002, value: 78.1 },
      { year: 2003, value: 78.9 },
      { year: 2004, value: 80.2 },
      { year: 2005, value: 81.5 },
      { year: 2006, value: 82.8 },
      { year: 2007, value: 84.7 },
      { year: 2008, value: 86.9 },
      { year: 2009, value: 87.2 },
      { year: 2010, value: 88.1 },
      { year: 2011, value: 90.0 },
      { year: 2012, value: 91.7 },
      { year: 2013, value: 93.1 },
      { year: 2014, value: 94.0 },
      { year: 2015, value: 94.5 },
      { year: 2016, value: 95.0 },
      { year: 2017, value: 96.4 },
      { year: 2018, value: 98.1 },
      { year: 2019, value: 99.5 },
      { year: 2020, value: 100.0 },
      { year: 2021, value: 103.1 },
      { year: 2022, value: 110.2 },
      { year: 2023, value: 116.7 },
    ],
  },
  {
    key: 'hpi',
    label: 'Häuserpreise',
    color: '#E8440A',
    values: [
      { year: 2000, value: 84.4 },
      { year: 2001, value: 84.4 },
      { year: 2002, value: 83.3 },
      { year: 2003, value: 83.6 },
      { year: 2004, value: 82.3 },
      { year: 2005, value: 83.3 },
      { year: 2006, value: 83.0 },
      { year: 2007, value: 81.2 },
      { year: 2008, value: 82.3 },
      { year: 2009, value: 83.0 },
      { year: 2010, value: 83.9 },
      { year: 2011, value: 86.8 },
      { year: 2012, value: 89.8 },
      { year: 2013, value: 92.6 },
      { year: 2014, value: 95.5 },
      { year: 2015, value: 100.0 },
      { year: 2016, value: 107.5 },
      { year: 2017, value: 114.1 },
      { year: 2018, value: 121.7 },
      { year: 2019, value: 128.7 },
      { year: 2020, value: 138.7 },
      { year: 2021, value: 154.7 },
      { year: 2022, value: 164.1 },
      { year: 2023, value: 150.3 },
    ],
  },
]

const ticks = [70, 90, 110, 130, 150, 170]

function xFor(year: number) {
  return padding.left + ((year - startYear) / (endYear - startYear)) * innerWidth
}

function yFor(value: number) {
  return padding.top + ((maxValue - value) / (maxValue - minValue)) * innerHeight
}

function linePath(values: DataPoint[]) {
  return values.map((point, index) => `${index === 0 ? 'M' : 'L'} ${xFor(point.year)} ${yFor(point.value)}`).join(' ')
}

function formatValue(value: number) {
  return String(value).replace('.', ',')
}

function firstValue(values: DataPoint[]) {
  return values[0]!
}

function lastValue(values: DataPoint[]) {
  return values[values.length - 1]!
}
</script>

<template>
  <figure
    class="chart"
    role="img"
    aria-label="Liniendiagramm mit Jahreswerten von 2000 bis 2023: Der Verbraucherpreisindex steigt von 75,5 auf 116,7. Der Häuserpreisindex bleibt bis 2010 fast flach, steigt danach stark bis 164,1 im Jahr 2022 und fällt 2023 auf 150,3."
  >
    <figcaption class="chart__title">
      Vermögenspreise liefen den Lebenshaltungskosten davon
    </figcaption>

    <p class="chart__subtitle">
      Jahresdurchschnitte 2000 bis 2023. Die Schere öffnet sich vor allem nach 2010.
    </p>

    <svg
      class="chart__svg"
      :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
      preserveAspectRatio="xMidYMid meet"
    >
      <line
        v-for="tick in ticks"
        :key="`grid-${tick}`"
        class="chart__grid"
        :x1="padding.left"
        :x2="chartWidth - padding.right"
        :y1="yFor(tick)"
        :y2="yFor(tick)"
      />

      <text
        v-for="tick in ticks"
        :key="`axis-${tick}`"
        class="chart__axis"
        :x="padding.left - 8"
        :y="yFor(tick) + 4"
        text-anchor="end"
      >
        {{ tick }}
      </text>

      <g
        v-for="year in yearTicks"
        :key="year"
      >
        <line
          class="chart__year-line"
          :x1="xFor(year)"
          :x2="xFor(year)"
          :y1="padding.top"
          :y2="chartHeight - padding.bottom"
        />
        <text
          class="chart__year"
          :x="xFor(year)"
          :y="chartHeight - 16"
          text-anchor="middle"
        >
          {{ year }}
        </text>
      </g>

      <g
        v-for="item in series"
        :key="item.key"
      >
        <path
          class="chart__line"
          :d="linePath(item.values)"
          :stroke="item.color"
        />

        <circle
          v-for="point in [firstValue(item.values), lastValue(item.values)]"
          :key="`${item.key}-${point.year}`"
          class="chart__point"
          :cx="xFor(point.year)"
          :cy="yFor(point.value)"
          r="5"
          :fill="item.color"
        />

        <text
          class="chart__label"
          :x="xFor(endYear) + 12"
          :y="yFor(lastValue(item.values).value) + 4"
        >
          {{ item.label }}: {{ formatValue(lastValue(item.values).value) }}
        </text>

        <text
          class="chart__value"
          :x="xFor(startYear) - 12"
          :y="yFor(firstValue(item.values).value) + 4"
          text-anchor="end"
        >
          {{ formatValue(firstValue(item.values).value) }}
        </text>
      </g>
    </svg>

    <p class="chart__source">
      Quelle: Destatis, Häuserpreisindex und Verbraucherpreisindex. Jahreswerte 2000 bis 2023: Verbraucherpreise +54,6 %, Häuserpreise +78,1 %.
    </p>
  </figure>
</template>

<style scoped>
.chart {
  max-width: 80ch;
  margin: 1.5rem 0;
  padding: 1rem;
  border: 1px solid var(--fackel-border);
  border-radius: 6px;
  background: #faf6f0;
}

.chart__title {
  margin-bottom: 0.35rem;
  font-family: 'Playfair Display', 'Book Antiqua', Palatino, Georgia, serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ink);
}

.chart__subtitle,
.chart__source {
  margin: 0 0 0.75rem;
  font-size: 0.88rem;
  line-height: 1.55;
  color: var(--muted);
}

.chart__source {
  margin: 0.75rem 0 0;
}

.chart__svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.chart__grid {
  stroke: var(--fackel-border);
  stroke-width: 1;
}

.chart__year-line {
  stroke: var(--fackel-border);
  stroke-width: 1;
  stroke-dasharray: 3 4;
}

.chart__line {
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
}

.chart__point {
  stroke: #faf6f0;
  stroke-width: 2;
}

.chart__axis,
.chart__year,
.chart__label,
.chart__value {
  font-family: 'Ubuntu Mono', monospace;
  fill: var(--muted);
}

.chart__axis,
.chart__year,
.chart__value {
  font-size: 11px;
}

.chart__label {
  font-size: 12px;
  font-weight: 700;
  fill: var(--ink);
}
</style>
