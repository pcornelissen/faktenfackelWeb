<script setup lang="ts">
import { computed } from 'vue'
import { area as d3area } from 'd3-shape'
import type { Serie } from '../charts/shared'
import { colorFor, formatValue, niceMax, ticks } from '../charts/shared'

const props = withDefaults(defineProps<{
  labels: string[]
  series: Serie[]
  unit?: string
  stacked?: boolean
  donut?: boolean
}>(), { unit: '', stacked: false, donut: false })

const viewW = 640
const padT = 16
const padR = 12
const padB = 56
const padL = 48
const chartH = 200
const legendH = 24
const viewH = padT + chartH + padB + legendH
const innerW = viewW - padL - padR

const maxValue = computed(() => {
  const raw = props.stacked
    ? Math.max(...props.labels.map((_, i) => props.series.reduce((s, ser) => s + (ser.values[i] ?? 0), 0)))
    : Math.max(...props.series.flatMap(s => s.values))
  return niceMax(raw)
})
const tickVals = computed(() => ticks(maxValue.value, 4))

function xFor(i: number) {
  return props.labels.length <= 1 ? padL + innerW / 2 : padL + (i / (props.labels.length - 1)) * innerW
}
function yFor(v: number) {
  return padT + chartH - (v / maxValue.value) * chartH
}
function baseline(si: number, i: number) {
  if (!props.stacked) return 0
  return props.series.slice(0, si).reduce((s, ser) => s + (ser.values[i] ?? 0), 0)
}

const areas = computed(() =>
  props.series.map((s, si) => ({
    d: d3area<number>()
      .x((_, i) => xFor(i))
      .y0((_, i) => yFor(baseline(si, i)))
      .y1((v, i) => yFor(baseline(si, i) + v))(s.values) ?? '',
    color: colorFor(si, s.color),
  })),
)

function fmt(v: number) {
  return formatValue(v, props.unit)
}
</script>

<template>
  <svg
    :viewBox="`0 0 ${viewW} ${viewH}`"
    class="ff-area"
    aria-hidden="true"
  >
    <g
      v-for="(t, ti) in tickVals"
      :key="ti"
    >
      <line
        :x1="padL"
        :x2="viewW - padR"
        :y1="yFor(t)"
        :y2="yFor(t)"
        class="ff-grid"
      />
      <text
        :x="padL - 6"
        :y="yFor(t) + 3"
        class="ff-ytick"
      >{{ fmt(t) }}</text>
    </g>
    <text
      v-for="(label, i) in labels"
      :key="i"
      :x="xFor(i)"
      :y="padT + chartH + 18"
      class="ff-xlabel"
    >{{ label }}</text>
    <!-- Nicht-gestapelt: Flächen überlappen halbtransparent; der Stroke hält die
         hinterste Serie lesbar. Für klar trennbare Anteile besser stacked nutzen. -->
    <path
      v-for="(a, ai) in areas"
      :key="ai"
      :d="a.d"
      :fill="a.color"
      :fill-opacity="stacked ? 0.85 : 0.45"
      :stroke="a.color"
      class="ff-areapath"
    />
    <g :transform="`translate(${padL}, ${padT + chartH + padB - 4})`">
      <g
        v-for="(serie, si) in series"
        :key="si"
        :transform="`translate(${si * Math.min(140, (viewW - padL - padR) / series.length)}, 0)`"
      >
        <rect
          width="12"
          height="12"
          :fill="colorFor(si, serie.color)"
        />
        <text
          x="18"
          y="10"
          class="ff-legend"
        >{{ serie.label }}</text>
      </g>
    </g>
  </svg>
</template>

<style scoped>
.ff-area { width: 100%; height: auto; max-height: 360px; display: block; }
.ff-grid { stroke: var(--fackel-border); stroke-width: 1; }
.ff-areapath { stroke-width: 1.5; }
.ff-ytick { font-family: 'Ubuntu Mono', monospace; font-size: 9px; fill: var(--muted); text-anchor: end; }
.ff-xlabel { font-family: 'Ubuntu Mono', monospace; font-size: 11px; fill: var(--ink); text-anchor: middle; }
.ff-legend { font-family: 'Ubuntu Mono', monospace; font-size: 11px; fill: var(--ink); dominant-baseline: middle; }
</style>
