<script setup lang="ts">
const chartWidth = 720
const chartHeight = 300
const padding = { top: 28, right: 26, bottom: 46, left: 64 }
const innerHeight = chartHeight - padding.top - padding.bottom
const groupGap = 132
const barWidth = 42
const minValue = 0
const maxValue = 80

const groups = [
  {
    label: 'West',
    values: [
      { year: '1998', value: 76 },
      { year: '2024', value: 50 },
    ],
  },
  {
    label: 'Ost',
    values: [
      { year: '1998', value: 63 },
      { year: '2024', value: 42 },
    ],
  },
]

const ticks = [0, 20, 40, 60, 80]

function yFor(value: number) {
  return padding.top + ((maxValue - value) / (maxValue - minValue)) * innerHeight
}

function barHeight(value: number) {
  return chartHeight - padding.bottom - yFor(value)
}

function groupX(index: number) {
  return padding.left + 112 + index * groupGap * 2
}

function barX(groupIndex: number, valueIndex: number) {
  return groupX(groupIndex) + (valueIndex === 0 ? -barWidth - 8 : 8)
}
</script>

<template>
  <figure
    class="chart"
    role="img"
    aria-label="Balkengrafik zur Tarifbindung: In Westdeutschland sank der Anteil tarifgebundener Beschäftigter von 76 Prozent 1998 auf 50 Prozent 2024. In Ostdeutschland sank er von 63 Prozent auf 42 Prozent."
  >
    <figcaption class="chart__title">
      Löhne verloren Verhandlungsmacht
    </figcaption>
    <p class="chart__subtitle">
      Weniger Tarifbindung heißt: Lohnerhöhungen müssen häufiger einzeln erkämpft werden, statt kollektiv durch Tarifverträge zu greifen.
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
        :key="`tick-${tick}`"
        class="chart__axis"
        :x="padding.left - 8"
        :y="yFor(tick) + 4"
        text-anchor="end"
      >
        {{ tick }} %
      </text>

      <g
        v-for="(group, groupIndex) in groups"
        :key="group.label"
      >
        <g
          v-for="(item, valueIndex) in group.values"
          :key="`${group.label}-${item.year}`"
        >
          <rect
            :class="['chart__bar', { 'chart__bar--current': item.year === '2024' }]"
            :x="barX(groupIndex, valueIndex)"
            :y="yFor(item.value)"
            :width="barWidth"
            :height="barHeight(item.value)"
            rx="4"
          />
          <text
            class="chart__value"
            :x="barX(groupIndex, valueIndex) + barWidth / 2"
            :y="yFor(item.value) - 8"
            text-anchor="middle"
          >
            {{ item.value }} %
          </text>
          <text
            class="chart__year"
            :x="barX(groupIndex, valueIndex) + barWidth / 2"
            :y="chartHeight - 24"
            text-anchor="middle"
          >
            {{ item.year }}
          </text>
        </g>

        <text
          class="chart__group"
          :x="groupX(groupIndex)"
          :y="chartHeight - 6"
          text-anchor="middle"
        >
          {{ group.label }}
        </text>
      </g>
    </svg>

    <p class="chart__source">
      Quelle: WSI-Tarifarchiv auf Basis des IAB-Betriebspanels. Gezeigt ist der Anteil der Beschäftigten mit Tarifbindung, inklusive Branchen- und Firmentarifverträgen.
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

.chart__axis,
.chart__value,
.chart__year,
.chart__group {
  font-family: 'Ubuntu Mono', monospace;
}

.chart__axis,
.chart__year {
  font-size: 11px;
  fill: var(--muted);
}

.chart__value,
.chart__group {
  font-size: 12px;
  font-weight: 700;
  fill: var(--ink);
}

.chart__bar {
  fill: var(--flame);
}

.chart__bar--current {
  fill: var(--ember);
}
</style>
