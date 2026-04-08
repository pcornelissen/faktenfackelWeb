<script setup lang="ts">
type WealthGroup = {
  label: string
  value: number
  highlight: boolean
}

const groups: WealthGroup[] = [
  { label: 'Obere 10 %', value: 54.0, highlight: true },
  { label: '80–90 %', value: 26.8, highlight: false },
  { label: '60–80 %', value: 14.0, highlight: false },
  { label: '40–60 %', value: 4.2, highlight: false },
  { label: '20–40 %', value: 1.3, highlight: false },
  { label: 'Untere 20 %', value: -0.3, highlight: false },
]

const chartWidth = 700
const chartHeight = 280
const padding = { top: 12, right: 80, bottom: 16, left: 110 }
const innerWidth = chartWidth - padding.left - padding.right
const innerHeight = chartHeight - padding.top - padding.bottom

const barCount = groups.length
const barGap = 6
const barHeight = (innerHeight - barGap * (barCount - 1)) / barCount

const maxValue = 60

const xFor = (value: number) => {
  if (value < 0) return padding.left
  return padding.left + (value / maxValue) * innerWidth
}

const barWidth = (value: number) => {
  if (value < 0) return (Math.abs(value) / maxValue) * innerWidth
  return (value / maxValue) * innerWidth
}

const barX = (value: number) => {
  if (value < 0) return padding.left - (Math.abs(value) / maxValue) * innerWidth
  return padding.left
}

const yFor = (index: number) => padding.top + index * (barHeight + barGap)

const xTicks = [0, 10, 20, 30, 40, 50, 60]
</script>

<template>
  <figure
    class="chart-figure"
    role="img"
    aria-label="Horizontales Balkendiagramm zur Verteilung des Nettovermögens in Deutschland nach Vermögensgruppen. Die oberen 10 Prozent besitzen 54 Prozent des gesamten Nettovermögens."
  >
    <figcaption class="chart-figure__title">
      Wer besitzt was? Verteilung des Nettovermögens in Deutschland
    </figcaption>

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

      <g
        v-for="(group, i) in groups"
        :key="group.label"
      >
        <text
          class="chart-figure__bar-label"
          :x="padding.left - 8"
          :y="yFor(i) + barHeight / 2 + 4"
          text-anchor="end"
        >
          {{ group.label }}
        </text>

        <rect
          :x="barX(group.value)"
          :y="yFor(i)"
          :width="barWidth(group.value)"
          :height="barHeight"
          :rx="2"
          :class="[
            'chart-figure__bar',
            group.highlight ? 'chart-figure__bar--highlight' : 'chart-figure__bar--default',
          ]"
        />

        <text
          class="chart-figure__value-label"
          :x="group.value >= 0 ? barX(group.value) + barWidth(group.value) + 6 : barX(group.value) - 6"
          :y="yFor(i) + barHeight / 2 + 4"
          :text-anchor="group.value >= 0 ? 'start' : 'end'"
        >
          {{ group.value >= 0 ? group.value.toFixed(1) : group.value.toFixed(1) }} %
        </text>
      </g>
    </svg>

    <p class="chart-figure__note">
      Quelle: Deutsche Bundesbank, PHF-Studie 2023. Der Anteil der oberen 10 % stammt direkt aus der Studie, die übrigen Gruppen sind für diese Übersicht gerundet zusammengefasst.
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
