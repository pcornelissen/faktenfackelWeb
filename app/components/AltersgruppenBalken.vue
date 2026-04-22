<script setup lang="ts">
interface Serie {
  label: string
  values: number[]
  color?: string
}

const props = withDefaults(defineProps<{
  title: string
  subtitle?: string
  labels: string[]
  series: Serie[]
  unit?: string
  formatValue?: (v: number) => string
  maxValue?: number
}>(), {
  subtitle: '',
  unit: '',
  formatValue: undefined,
  maxValue: undefined,
})

const palette = ['var(--flame)', 'var(--ember)', '#78716C', '#525252']

function colorFor(i: number, explicit?: string) {
  return explicit || palette[i % palette.length]
}

const maxValue = computed(() => {
  if (props.maxValue) return props.maxValue
  return Math.max(...props.series.flatMap(s => s.values))
})

const viewW = 640
const padT = 20
const padL = 8
const padR = 8
const padB = 56
const legendH = 24

const nGroups = computed(() => props.labels.length)
const nSeries = computed(() => props.series.length)

const groupW = computed(() => (viewW - padL - padR) / nGroups.value)
const barGap = 2
const groupPad = 8
const barW = computed(() => (groupW.value - groupPad * 2 - barGap * (nSeries.value - 1)) / nSeries.value)
const chartH = 200
const viewH = padT + chartH + padB + legendH

function barHeight(v: number) {
  return (v / maxValue.value) * chartH
}

function fmt(v: number) {
  if (props.formatValue) return props.formatValue(v)
  if (props.unit === '%') return v.toFixed(1).replace('.', ',') + '\u202F%'
  if (v >= 1000000) return (v / 1000000).toFixed(1).replace('.', ',') + '\u202FMio.'
  if (v >= 1000) return (v / 1000).toFixed(0) + '\u202FTsd.'
  return String(v)
}

function xForBar(groupIdx: number, seriesIdx: number) {
  return padL + groupIdx * groupW.value + groupPad + seriesIdx * (barW.value + barGap)
}
function yForBar(v: number) {
  return padT + chartH - barHeight(v)
}
</script>

<template>
  <figure class="agb-figure">
    <figcaption class="agb-caption">
      <strong>{{ title }}</strong>
      <span
        v-if="subtitle"
        class="agb-sub"
      >{{ subtitle }}</span>
    </figcaption>

    <div class="agb-chart">
      <svg
        :viewBox="`0 0 ${viewW} ${viewH}`"
        class="agb-svg"
        role="img"
        :aria-label="title"
      >
        <!-- Y axis baseline -->
        <line
          :x1="padL"
          :x2="viewW - padR"
          :y1="padT + chartH"
          :y2="padT + chartH"
          class="agb-axis"
        />

        <!-- Bars -->
        <g
          v-for="(label, gi) in labels"
          :key="`g-${gi}`"
        >
          <g
            v-for="(serie, si) in series"
            :key="`s-${gi}-${si}`"
          >
            <rect
              :x="xForBar(gi, si)"
              :y="yForBar(serie.values[gi] ?? 0)"
              :width="barW"
              :height="barHeight(serie.values[gi] ?? 0)"
              :fill="colorFor(si, serie.color)"
              class="agb-bar"
            />
            <text
              :x="xForBar(gi, si) + barW / 2"
              :y="yForBar(serie.values[gi] ?? 0) - 4"
              class="agb-bar-value"
            >{{ fmt(serie.values[gi] ?? 0) }}</text>
          </g>
          <text
            :x="padL + gi * groupW + groupW / 2"
            :y="padT + chartH + 18"
            class="agb-group-label"
          >{{ label }}</text>
        </g>

        <!-- Legend -->
        <g :transform="`translate(${padL}, ${padT + chartH + padB - 4})`">
          <g
            v-for="(serie, si) in series"
            :key="`l-${si}`"
            :transform="`translate(${si * 140}, 0)`"
          >
            <rect
              width="12"
              height="12"
              :fill="colorFor(si, serie.color)"
            />
            <text
              x="18"
              y="10"
              class="agb-legend"
            >{{ serie.label }}</text>
          </g>
        </g>
      </svg>
    </div>
  </figure>
</template>

<style scoped>
.agb-figure {
  margin: 1.5rem 0;
  padding: 1.25rem;
  border: 1px solid var(--fackel-border);
  border-radius: 0.5rem;
  background: var(--paper);
}
.agb-caption {
  display: block;
  margin-bottom: 0.75rem;
  font-family: 'Playfair Display', serif;
}
.agb-caption strong {
  display: block;
  font-size: 1.05rem;
  color: var(--ink);
}
.agb-sub {
  display: block;
  margin-top: 0.25rem;
  font-family: 'Source Serif 4', serif;
  font-size: 0.85rem;
  color: var(--muted);
}
.agb-chart {
  margin-top: 0.5rem;
}
.agb-svg {
  width: 100%;
  height: auto;
  max-height: 360px;
  display: block;
}
.agb-axis {
  stroke: var(--muted);
  stroke-width: 1;
  opacity: 0.4;
}
.agb-bar {
  transition: height 0.4s, y 0.4s;
}
.agb-bar-value {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 9px;
  fill: var(--muted);
  text-anchor: middle;
}
.agb-group-label {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 11px;
  fill: var(--ink);
  text-anchor: middle;
}
.agb-legend {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 11px;
  fill: var(--ink);
  dominant-baseline: middle;
}
</style>
