<script setup lang="ts">
/**
 * Daten: FRED (Federal Reserve Bank of St. Louis)
 * - Corporate Profits After Tax: https://fred.stlouisfed.org/series/CP
 * - Corporate Income Tax: https://fred.stlouisfed.org/series/B075RC1Q027SBEA
 * Werte: Billions of Dollars, Quarterly, Seasonally Adjusted Annual Rate
 * Hier: Jahresdurchschnitte ausgewählter Jahre für Übersichtlichkeit
 */
type DataPoint = {
  year: number
  profit: number
  tax: number
}

const data: DataPoint[] = [
  { year: 1988, profit: 265.9, tax: 93.8 },
  { year: 1993, profit: 357.0, tax: 122.5 },
  { year: 1998, profit: 533.0, tax: 177.7 },
  { year: 2000, profit: 553.0, tax: 194.1 },
  { year: 2003, profit: 776.8, tax: 175.8 },
  { year: 2006, profit: 1463.5, tax: 366.0 },
  { year: 2008, profit: 1182.8, tax: 202.0 },
  { year: 2010, profit: 1606.4, tax: 219.4 },
  { year: 2013, profit: 1857.7, tax: 298.4 },
  { year: 2015, profit: 1841.4, tax: 329.1 },
  { year: 2017, profit: 1998.0, tax: 230.3 },
  { year: 2019, profit: 2078.3, tax: 210.5 },
  { year: 2021, profit: 2897.9, tax: 335.5 },
  { year: 2023, profit: 3242.2, tax: 426.5 },
]

const chartWidth = 700
const chartHeight = 340
const padding = { top: 20, right: 60, bottom: 60, left: 56 }
const innerWidth = chartWidth - padding.left - padding.right
const innerHeight = chartHeight - padding.top - padding.bottom

const minYear = 1988
const maxYear = 2023
const maxValue = 3600

const xFor = (year: number) =>
  padding.left + ((year - minYear) / (maxYear - minYear)) * innerWidth

const yFor = (value: number) =>
  padding.top + innerHeight - (value / maxValue) * innerHeight

const yTicks = [0, 500, 1000, 1500, 2000, 2500, 3000, 3500]
const xTicks = [1988, 1993, 1998, 2003, 2008, 2013, 2018, 2023]

const linePath = (accessor: (d: DataPoint) => number) =>
  data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xFor(d.year)} ${yFor(accessor(d))}`)
    .join(' ')

const profitPath = linePath(d => d.profit)
const taxPath = linePath(d => d.tax)

const lastPoint = data[data.length - 1]!
</script>

<template>
  <figure
    class="chart-figure"
    role="img"
    aria-label="Liniendiagramm: Unternehmensgewinne vs. Unternehmenssteuern in den USA 1988-2023. Die Gewinne sind von 266 auf 3.242 Milliarden Dollar gestiegen, die Steuern nur von 94 auf 427 Milliarden."
  >
    <figcaption class="chart-figure__title">
      Unternehmensgewinne vs. Unternehmenssteuern (USA)
    </figcaption>

    <div class="chart-figure__legend">
      <span><i class="chart-figure__swatch chart-figure__swatch--profit" />Unternehmensgewinne (nach Steuern)</span>
      <span><i class="chart-figure__swatch chart-figure__swatch--tax" />Unternehmenssteuereinnahmen</span>
    </div>

    <svg
      class="chart-figure__svg"
      :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
      preserveAspectRatio="xMidYMid meet"
    >
      <!-- Grid lines -->
      <line
        v-for="tick in yTicks"
        :key="`grid-${tick}`"
        class="chart-figure__grid"
        :x1="padding.left"
        :x2="chartWidth - padding.right"
        :y1="yFor(tick)"
        :y2="yFor(tick)"
      />

      <!-- Y axis labels -->
      <text
        v-for="tick in yTicks"
        :key="`y-label-${tick}`"
        class="chart-figure__axis-label"
        :x="padding.left - 10"
        :y="yFor(tick) + 4"
        text-anchor="end"
      >
        {{ tick === 0 ? '0' : `${(tick / 1000).toFixed(tick >= 1000 ? 1 : 0)}` }} {{ tick >= 1000 ? 'Bio.' : 'Mrd.' }}
      </text>

      <!-- X axis labels -->
      <text
        v-for="year in xTicks"
        :key="`x-label-${year}`"
        class="chart-figure__axis-label"
        :x="xFor(year)"
        :y="chartHeight - padding.bottom + 20"
        text-anchor="middle"
      >
        {{ year }}
      </text>

      <!-- Area under profit line -->
      <path
        :d="`${profitPath} L ${xFor(2023)} ${yFor(0)} L ${xFor(1988)} ${yFor(0)} Z`"
        class="chart-figure__area chart-figure__area--profit"
      />

      <!-- Lines -->
      <path
        :d="profitPath"
        class="chart-figure__line chart-figure__line--profit"
      />
      <path
        :d="taxPath"
        class="chart-figure__line chart-figure__line--tax"
      />

      <!-- Dots -->
      <circle
        v-for="d in data"
        :key="`dot-profit-${d.year}`"
        class="chart-figure__dot chart-figure__dot--profit"
        :cx="xFor(d.year)"
        :cy="yFor(d.profit)"
        r="3"
      />
      <circle
        v-for="d in data"
        :key="`dot-tax-${d.year}`"
        class="chart-figure__dot chart-figure__dot--tax"
        :cx="xFor(d.year)"
        :cy="yFor(d.tax)"
        r="3"
      />

      <!-- End labels -->
      <text
        class="chart-figure__series-end chart-figure__series-end--profit"
        :x="xFor(2023) + 8"
        :y="yFor(lastPoint.profit) - 4"
      >
        ${{ (lastPoint.profit / 1000).toFixed(1) }} Bio.
      </text>
      <text
        class="chart-figure__series-end chart-figure__series-end--tax"
        :x="xFor(2023) + 8"
        :y="yFor(lastPoint.tax) + 4"
      >
        ${{ lastPoint.tax }} Mrd.
      </text>
    </svg>

    <p class="chart-figure__note">
      Daten: Federal Reserve Bank of St. Louis (FRED). Unternehmensgewinne:
      <a
        href="https://fred.stlouisfed.org/series/CP"
        target="_blank"
        rel="noopener"
      >Serie CP</a>,
      Steuereinnahmen:
      <a
        href="https://fred.stlouisfed.org/series/B075RC1Q027SBEA"
        target="_blank"
        rel="noopener"
      >Serie B075RC1Q027SBEA</a>.
      Werte in Milliarden US-Dollar (Seasonally Adjusted Annual Rate), Jahresdurchschnitte der Quartalswerte.
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

.chart-figure__swatch--profit {
  background: var(--flame);
}

.chart-figure__swatch--tax {
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

.chart-figure__area--profit {
  fill: var(--flame);
  opacity: 0.08;
}

.chart-figure__line {
  fill: none;
  stroke-width: 2.5;
}

.chart-figure__line--profit {
  stroke: var(--flame);
}

.chart-figure__line--tax {
  stroke: var(--muted);
  stroke-width: 2;
}

.chart-figure__dot--profit {
  fill: var(--flame);
}

.chart-figure__dot--tax {
  fill: var(--muted);
}

.chart-figure__series-end {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 11px;
  font-weight: 700;
}

.chart-figure__series-end--profit {
  fill: var(--flame);
}

.chart-figure__series-end--tax {
  fill: var(--muted);
}

.chart-figure__note {
  margin: 0.75rem 0 0;
  font-size: 0.82rem;
  line-height: 1.55;
  color: var(--muted);
}

.chart-figure__note a {
  color: var(--muted);
  text-decoration: underline;
}
</style>
