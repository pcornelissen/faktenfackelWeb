<script setup lang="ts">
const taxLoss = 5.7
const maxValue = 6
const chartWidth = 700
const chartHeight = 180
const padding = { top: 20, right: 24, bottom: 28, left: 44 }
const innerWidth = chartWidth - padding.left - padding.right
const barHeight = 34
const y = 64
const xTicks = [0, 2, 4, 6]

const xFor = (value: number) => padding.left + (value / maxValue) * innerWidth
const widthFor = (value: number) => (value / maxValue) * innerWidth
</script>

<template>
  <figure
    class="chart-figure"
    role="img"
    aria-label="Balkengrafik zu geschätzten jährlichen Steuerausfällen in Deutschland durch Gewinnverlagerung in Niedrigsteuerländer"
  >
    <figcaption class="chart-figure__title">
      Geschätzte Steuerausfälle durch Gewinnverlagerung
    </figcaption>

    <p class="chart-figure__subtitle">
      Deutschland verliert laut ifo-Schätzung rund 5,7 Milliarden Euro pro Jahr.
    </p>

    <svg
      class="chart-figure__svg"
      :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
      preserveAspectRatio="xMidYMid meet"
    >
      <line
        v-for="tick in xTicks"
        :key="`grid-${tick}`"
        class="chart-figure__grid"
        :x1="xFor(tick)"
        :x2="xFor(tick)"
        :y1="padding.top"
        :y2="chartHeight - padding.bottom"
      />

      <text
        v-for="tick in xTicks"
        :key="`tick-${tick}`"
        class="chart-figure__axis-label"
        :x="xFor(tick)"
        :y="chartHeight - 8"
        text-anchor="middle"
      >
        {{ tick }}
      </text>

      <rect
        class="chart-figure__track"
        :x="padding.left"
        :y="y"
        :width="innerWidth"
        :height="barHeight"
        rx="4"
      />

      <rect
        class="chart-figure__bar"
        :x="padding.left"
        :y="y"
        :width="widthFor(taxLoss)"
        :height="barHeight"
        rx="4"
      />

      <text
        class="chart-figure__value"
        :x="xFor(taxLoss) - 8"
        :y="y - 8"
        text-anchor="end"
      >
        5,7 Mrd. €
      </text>

      <text
        class="chart-figure__bar-label"
        :x="padding.left + 10"
        :y="y + 22"
      >
        Gewinnverlagerung in Niedrigsteuerländer
      </text>
    </svg>

    <p class="chart-figure__note">
      Quelle:
      <a
        href="https://www.ifo.de/pressemitteilung/2021-01-20/gewinnverlagerung-niedrigsteuerlaender-staat"
        target="_blank"
        rel="noopener noreferrer"
      >ifo Institut, 20.01.2021</a>.
      Die Schätzung bezieht sich auf grenzüberschreitende Gewinnverlagerung insgesamt, nicht nur auf Big-Tech-Konzerne.
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
  margin-bottom: 0.35rem;
  font-family: 'Playfair Display', 'Book Antiqua', Palatino, Georgia, serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ink);
}

.chart-figure__subtitle {
  margin: 0 0 0.75rem;
  font-size: 0.92rem;
  line-height: 1.5;
  color: var(--muted);
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

.chart-figure__track {
  fill: #eee7dc;
}

.chart-figure__bar {
  fill: var(--ember);
}

.chart-figure__value {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  fill: var(--ember);
}

.chart-figure__bar-label {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 11px;
  fill: var(--paper);
}

.chart-figure__note {
  margin: 0.75rem 0 0;
  font-size: 0.82rem;
  line-height: 1.55;
  color: var(--muted);
}
</style>
