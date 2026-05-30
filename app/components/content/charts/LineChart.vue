<script setup lang="ts">
import { computed } from 'vue'
import { line as d3line } from 'd3-shape'
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

const maxValue = computed(() => niceMax(Math.max(...props.series.flatMap(s => s.values))))
const tickVals = computed(() => ticks(maxValue.value, 4))

function xFor(i: number) {
  return props.labels.length <= 1 ? padL + innerW / 2 : padL + (i / (props.labels.length - 1)) * innerW
}
function yFor(v: number) {
  return padT + chartH - (v / maxValue.value) * chartH
}

const paths = computed(() =>
  props.series.map((s, si) => ({
    d: d3line<number>().x((_, i) => xFor(i)).y(v => yFor(v))(s.values) ?? '',
    color: colorFor(si, s.color),
    points: s.values.map((v, i) => ({ x: xFor(i), y: yFor(v) })),
  })),
)

function fmt(v: number) {
  return formatValue(v, props.unit)
}
</script>

<template>
  <svg
    :viewBox="`0 0 ${viewW} ${viewH}`"
    class="ff-line"
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
    <g
      v-for="(p, pi) in paths"
      :key="pi"
    >
      <path
        :d="p.d"
        :stroke="p.color"
        class="ff-path"
      />
      <circle
        v-for="(pt, ci) in p.points"
        :key="ci"
        :cx="pt.x"
        :cy="pt.y"
        r="2.5"
        :fill="p.color"
      />
    </g>
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
.ff-line { width: 100%; height: auto; max-height: 360px; display: block; }
.ff-grid { stroke: var(--fackel-border); stroke-width: 1; }
.ff-path { fill: none; stroke-width: 2; }
.ff-ytick { font-family: 'Ubuntu Mono', monospace; font-size: 9px; fill: var(--muted); text-anchor: end; }
.ff-xlabel { font-family: 'Ubuntu Mono', monospace; font-size: 11px; fill: var(--ink); text-anchor: middle; }
.ff-legend { font-family: 'Ubuntu Mono', monospace; font-size: 11px; fill: var(--ink); dominant-baseline: middle; }
</style>
