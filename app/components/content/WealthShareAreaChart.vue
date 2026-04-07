<script setup lang="ts">
type WealthSharePoint = {
  year: number
  bottom50: number
  middle40: number
  top10: number
}

const points: WealthSharePoint[] = [
  { year: 1953, bottom50: 2.7, middle40: 41.7, top10: 55.6 },
  { year: 1957, bottom50: 4.16, middle40: 42.96, top10: 52.88 },
  { year: 1960, bottom50: 9.46, middle40: 43.29, top10: 47.25 },
  { year: 1963, bottom50: 15.77, middle40: 42.26, top10: 41.97 },
  { year: 1966, bottom50: 21.2, middle40: 39.31, top10: 39.5 },
  { year: 1969, bottom50: 29.68, middle40: 36.39, top10: 33.93 },
  { year: 1972, bottom50: 15.35, middle40: 44.37, top10: 40.28 },
  { year: 1974, bottom50: 13.3, middle40: 44.18, top10: 42.52 },
  { year: 1977, bottom50: 14.83, middle40: 43.02, top10: 42.14 },
  { year: 1980, bottom50: 15.12, middle40: 41.99, top10: 42.88 },
  { year: 1983, bottom50: 16.08, middle40: 41.02, top10: 42.9 },
  { year: 1986, bottom50: 15.64, middle40: 42.06, top10: 42.3 },
  { year: 1989, bottom50: 23.99, middle40: 37.11, top10: 38.9 },
  { year: 1993, bottom50: 4.5, middle40: 39.82, top10: 55.68 },
  { year: 1998, bottom50: 3.4, middle40: 39.16, top10: 57.44 },
  { year: 2003, bottom50: 2.42, middle40: 39.31, top10: 58.27 },
  { year: 2008, bottom50: 1.65, middle40: 38.02, top10: 60.33 },
  { year: 2013, bottom50: 2.59, middle40: 39.32, top10: 58.1 },
  { year: 2018, bottom50: 2.54, middle40: 38.48, top10: 58.98 },
]

const firstPoint = points[0]
const lastPoint = points.at(-1)

if (!firstPoint || !lastPoint) {
  throw new Error('WealthShareAreaChart requires at least one data point.')
}

const chartWidth = 760
const chartHeight = 360
const padding = {
  top: 18,
  right: 16,
  bottom: 46,
  left: 48,
}

const minYear = firstPoint.year
const maxYear = lastPoint.year
const innerWidth = chartWidth - padding.left - padding.right
const innerHeight = chartHeight - padding.top - padding.bottom

const tickYears = [1953, 1960, 1969, 1980, 1989, 1993, 2003, 2018]
const yTicks = [0, 25, 50, 75, 100]

const xFor = (year: number) =>
  padding.left + ((year - minYear) / (maxYear - minYear)) * innerWidth

const yFor = (value: number) =>
  padding.top + innerHeight - (value / 100) * innerHeight

const areaPath = (
  upperValue: (point: WealthSharePoint) => number,
  lowerValue: (point: WealthSharePoint) => number,
) => {
  const upper = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${xFor(point.year)} ${yFor(upperValue(point))}`)
    .join(' ')
  const lower = [...points]
    .reverse()
    .map(point => `L ${xFor(point.year)} ${yFor(lowerValue(point))}`)
    .join(' ')

  return `${upper} ${lower} Z`
}

const bottomPath = areaPath(
  point => point.bottom50,
  () => 0,
)

const middlePath = areaPath(
  point => point.bottom50 + point.middle40,
  point => point.bottom50,
)

const topPath = areaPath(
  () => 100,
  point => point.bottom50 + point.middle40,
)

const rightEdge = lastPoint
const bottomLabelY = yFor(rightEdge.bottom50 / 2)
const middleLabelY = yFor(rightEdge.bottom50 + rightEdge.middle40 / 2)
const topLabelY = yFor(rightEdge.bottom50 + rightEdge.middle40 + rightEdge.top10 / 2)
</script>

<template>
  <figure class="wealth-chart">
    <figcaption class="wealth-chart__title">
      Vermögensanteile seit 1953
    </figcaption>

    <div class="wealth-chart__legend">
      <span><i class="wealth-chart__swatch wealth-chart__swatch--bottom" />Untere 50 %</span>
      <span><i class="wealth-chart__swatch wealth-chart__swatch--middle" />Mittlere 40 %</span>
      <span><i class="wealth-chart__swatch wealth-chart__swatch--top" />Oberste 10 %</span>
    </div>

    <svg
      class="wealth-chart__svg"
      :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
      role="img"
      aria-label="Stacked-Flächengrafik zur Vermögensverteilung in Deutschland seit 1953"
    >
      <g>
        <line
          v-for="tick in yTicks"
          :key="`y-${tick}`"
          class="wealth-chart__grid"
          :x1="padding.left"
          :x2="chartWidth - padding.right"
          :y1="yFor(tick)"
          :y2="yFor(tick)"
        />

        <text
          v-for="tick in yTicks"
          :key="`y-label-${tick}`"
          class="wealth-chart__axis-label"
          :x="padding.left - 10"
          :y="yFor(tick) + 4"
          text-anchor="end"
        >
          {{ tick }} %
        </text>

        <path
          :d="topPath"
          class="wealth-chart__area wealth-chart__area--top"
        />
        <path
          :d="middlePath"
          class="wealth-chart__area wealth-chart__area--middle"
        />
        <path
          :d="bottomPath"
          class="wealth-chart__area wealth-chart__area--bottom"
        />

        <line
          class="wealth-chart__break"
          :x1="xFor(1991)"
          :x2="xFor(1991)"
          :y1="padding.top"
          :y2="chartHeight - padding.bottom"
        />

        <text
          class="wealth-chart__break-label"
          :x="xFor(1991) + 8"
          :y="padding.top + 18"
        >
          Methodenbruch
        </text>

        <text
          class="wealth-chart__series-label wealth-chart__series-label--top"
          :x="chartWidth - padding.right - 6"
          :y="topLabelY + 4"
          text-anchor="end"
        >
          Oberste 10 %
        </text>
        <text
          class="wealth-chart__series-label wealth-chart__series-label--middle"
          :x="chartWidth - padding.right - 6"
          :y="middleLabelY + 4"
          text-anchor="end"
        >
          Mittlere 40 %
        </text>
        <text
          class="wealth-chart__series-label wealth-chart__series-label--bottom"
          :x="chartWidth - padding.right - 6"
          :y="bottomLabelY + 4"
          text-anchor="end"
        >
          Untere 50 %
        </text>

        <text
          v-for="year in tickYears"
          :key="`x-${year}`"
          class="wealth-chart__axis-label"
          :x="xFor(year)"
          :y="chartHeight - padding.bottom + 22"
          text-anchor="middle"
        >
          {{ year }}
        </text>
      </g>
    </svg>

    <p class="wealth-chart__note">
      Quelle:
      <a
        href="https://wid.world/news-article/wealth-and-its-distribution-in-germany/"
        target="_blank"
        rel="noopener noreferrer"
      >World Inequality Database, "Wealth and its Distribution in Germany"</a>
      und das
      <a
        href="https://zenodo.org/records/17399187"
        target="_blank"
        rel="noopener noreferrer"
      >Zenodo-Replikationspaket von Albers, Bartels und Schularick</a>.
      Verwendet wurden die Dateien <code>Shares_1953.dta</code> bis <code>Shares_1989.dta</code> sowie <code>Shares_Germany.dta</code>.
    </p>

    <p class="wealth-chart__note">
      Hinweis: 1953 bis 1989 zeigt die Reihe Westdeutschland auf Basis der Langfristserie aus Steuer- und Vermögensdaten.
      Ab 1993 zeigt sie Gesamtdeutschland auf Basis der im Paper zusammengeführten Survey- und Makrodaten.
      Die Zäsur ist deshalb im Chart markiert.
    </p>
  </figure>
</template>

<style scoped>
.wealth-chart {
  max-width: 80ch;
  margin: 1.5rem 0;
  padding: 1rem;
  border: 1px solid var(--fackel-border);
  border-radius: 6px;
  background: #faf6f0;
}

.wealth-chart__title {
  margin-bottom: 0.5rem;
  font-family: 'Playfair Display', 'Book Antiqua', Palatino, Georgia, serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ink);
}

.wealth-chart__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
  margin-bottom: 0.85rem;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.78rem;
  color: var(--muted);
}

.wealth-chart__legend span {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.wealth-chart__swatch {
  display: inline-block;
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 2px;
}

.wealth-chart__swatch--bottom {
  background: #f6b36a;
}

.wealth-chart__swatch--middle {
  background: #ef7d32;
}

.wealth-chart__swatch--top {
  background: #b53a10;
}

.wealth-chart__svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.wealth-chart__grid {
  stroke: var(--fackel-border);
  stroke-width: 1;
}

.wealth-chart__area {
  stroke-width: 1.4;
}

.wealth-chart__area--bottom {
  fill: rgba(246, 179, 106, 0.9);
  stroke: #e59a45;
}

.wealth-chart__area--middle {
  fill: rgba(239, 125, 50, 0.85);
  stroke: #d96a23;
}

.wealth-chart__area--top {
  fill: rgba(181, 58, 16, 0.88);
  stroke: #8f2708;
}

.wealth-chart__axis-label,
.wealth-chart__series-label,
.wealth-chart__break-label {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 11px;
  fill: var(--muted);
}

.wealth-chart__series-label {
  font-weight: 700;
}

.wealth-chart__series-label--top {
  fill: var(--paper);
}

.wealth-chart__series-label--middle,
.wealth-chart__series-label--bottom {
  fill: var(--smoke);
}

.wealth-chart__break {
  stroke: var(--smoke);
  stroke-width: 1;
  stroke-dasharray: 4 4;
  opacity: 0.65;
}

.wealth-chart__break-label {
  fill: var(--smoke);
}

.wealth-chart__note {
  margin: 0.75rem 0 0;
  font-size: 0.88rem;
  line-height: 1.55;
  color: var(--muted);
}

.wealth-chart__note code {
  font-size: 0.82em;
}
</style>
