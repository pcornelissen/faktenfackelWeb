<script setup lang="ts">
const chartWidth = 720
const chartHeight = 310
const padding = { top: 28, right: 34, bottom: 38, left: 190 }
const innerWidth = chartWidth - padding.left - padding.right
const maxValue = 45

const data = [
  {
    label: 'DIW, konservativ',
    value: 30,
    unit: 'Mrd. Euro',
    detail: 'Unternehmenssteuervermeidung',
    kind: 'loss',
  },
  {
    label: 'TJN, Gewinnverlagerung',
    value: 37.7,
    unit: 'Mrd. US-Dollar',
    detail: 'Corporate Profit Shifting',
    kind: 'loss',
  },
  {
    label: 'TJN, Gesamtverlust',
    value: 43.9,
    unit: 'Mrd. US-Dollar',
    detail: 'inkl. private Offshore-Steuerhinterziehung',
    kind: 'loss',
  },
  {
    label: 'Pillar 2',
    value: 1.6,
    unit: 'Mrd. Euro',
    detail: 'erwartete Mehreinnahmen',
    kind: 'repair',
  },
]

const ticks = [0, 10, 20, 30, 40]
const barHeight = 26
const rowGap = 48

function xFor(value: number) {
  return padding.left + (value / maxValue) * innerWidth
}

function widthFor(value: number) {
  return (value / maxValue) * innerWidth
}

function yFor(index: number) {
  return padding.top + index * rowGap + 34
}

function formatValue(value: number) {
  return String(value).replace('.', ',')
}
</script>

<template>
  <figure
    class="chart"
    role="img"
    aria-label="Balkengrafik zu geschätzten Steuerverlusten durch Gewinnverlagerung: DIW 30 Milliarden Euro, Tax Justice Network 37,7 Milliarden US-Dollar durch Gewinnverlagerung und 43,9 Milliarden US-Dollar Gesamtverlust. Pillar 2 bringt Deutschland voraussichtlich nur etwa 1,6 Milliarden Euro Mehreinnahmen."
  >
    <figcaption class="chart__title">
      Das Steuerleck ist viel größer als die Reparatur
    </figcaption>
    <p class="chart__subtitle">
      Unterschiedliche Methoden, gleiche Größenordnung: Die geschätzten Ausfälle liegen weit über den erwarteten Mehreinnahmen der Mindeststeuer.
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
        :x1="xFor(tick)"
        :x2="xFor(tick)"
        :y1="padding.top"
        :y2="chartHeight - padding.bottom"
      />
      <text
        v-for="tick in ticks"
        :key="`tick-${tick}`"
        class="chart__axis"
        :x="xFor(tick)"
        :y="chartHeight - 14"
        text-anchor="middle"
      >
        {{ tick }}
      </text>

      <g
        v-for="(item, index) in data"
        :key="item.label"
      >
        <text
          class="chart__label"
          :x="padding.left - 14"
          :y="yFor(index) + 17"
          text-anchor="end"
        >
          {{ item.label }}
        </text>
        <rect
          :class="['chart__bar', `chart__bar--${item.kind}`]"
          :x="padding.left"
          :y="yFor(index)"
          :width="widthFor(item.value)"
          :height="barHeight"
          rx="4"
        />
        <text
          class="chart__value"
          :x="xFor(item.value) + 8"
          :y="yFor(index) + 17"
        >
          {{ formatValue(item.value) }} {{ item.unit }}
        </text>
        <text
          class="chart__detail"
          :x="padding.left"
          :y="yFor(index) - 8"
        >
          {{ item.detail }}
        </text>
      </g>
    </svg>

    <p class="chart__source">
      Quellen: Tax Justice Network, State of Tax Justice 2024; DIW-Einordnung über Netzwerk Steuergerechtigkeit; ifo-Schätzung zu Pillar 2. Die Werte werden in den Originalwährungen der Quellen gezeigt und dienen als Größenordnungsvergleich.
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
.chart__label,
.chart__value,
.chart__detail {
  font-family: 'Ubuntu Mono', monospace;
}

.chart__axis,
.chart__detail {
  font-size: 11px;
  fill: var(--muted);
}

.chart__label {
  font-size: 11px;
  fill: var(--ink);
}

.chart__value {
  font-size: 12px;
  font-weight: 700;
  fill: var(--ink);
}

.chart__bar--loss {
  fill: var(--ember);
}

.chart__bar--repair {
  fill: var(--flame);
}
</style>
