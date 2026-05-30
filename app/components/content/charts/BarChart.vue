<script setup lang="ts">
import { computed } from 'vue'
import type { Serie } from '../charts/shared'
import { colorFor, formatValue, niceMax } from '../charts/shared'

const props = withDefaults(defineProps<{
  labels: string[]
  series: Serie[]
  unit?: string
  stacked?: boolean
  donut?: boolean
}>(), { unit: '', stacked: false, donut: false })

const viewW = 640
const padT = 20
const padL = 8
const padR = 8
const padB = 56
const legendH = 24
const chartH = 200
const viewH = padT + chartH + padB + legendH
const groupPad = 8
const barGap = 2

const maxValue = computed(() => {
  const raw = props.stacked
    ? Math.max(...props.labels.map((_, gi) => props.series.reduce((sum, s) => sum + (s.values[gi] ?? 0), 0)))
    : Math.max(...props.series.flatMap(s => s.values))
  return niceMax(raw)
})

const groupW = computed(() => (viewW - padL - padR) / props.labels.length)
const barW = computed(() =>
  props.stacked
    ? Math.max(1, groupW.value - groupPad * 2)
    : Math.max(1, (groupW.value - groupPad * 2 - barGap * (props.series.length - 1)) / props.series.length),
)

function h(v: number) {
  return (v / maxValue.value) * chartH
}
function groupedX(gi: number, si: number) {
  return padL + gi * groupW.value + groupPad + si * (barW.value + barGap)
}
function stackedX(gi: number) {
  return padL + gi * groupW.value + groupPad
}
function stackedY(gi: number, si: number) {
  const below = props.series.slice(0, si).reduce((sum, s) => sum + (s.values[gi] ?? 0), 0)
  return padT + chartH - h(below + (props.series[si]!.values[gi] ?? 0))
}
function fmt(v: number) {
  return formatValue(v, props.unit)
}
</script>

<template>
  <svg
    :viewBox="`0 0 ${viewW} ${viewH}`"
    class="ff-bar"
    aria-hidden="true"
  >
    <line
      :x1="padL"
      :x2="viewW - padR"
      :y1="padT + chartH"
      :y2="padT + chartH"
      class="ff-axis"
    />

    <g
      v-for="(label, gi) in labels"
      :key="gi"
    >
      <template v-if="stacked">
        <rect
          v-for="(serie, si) in series"
          :key="si"
          :x="stackedX(gi)"
          :y="stackedY(gi, si)"
          :width="barW"
          :height="h(serie.values[gi] ?? 0)"
          :fill="colorFor(si, serie.color)"
        />
      </template>
      <template v-else>
        <g
          v-for="(serie, si) in series"
          :key="si"
        >
          <rect
            :x="groupedX(gi, si)"
            :y="padT + chartH - h(serie.values[gi] ?? 0)"
            :width="barW"
            :height="h(serie.values[gi] ?? 0)"
            :fill="colorFor(si, serie.color)"
          />
          <text
            :x="groupedX(gi, si) + barW / 2"
            :y="padT + chartH - h(serie.values[gi] ?? 0) - 4"
            class="ff-val"
          >{{ fmt(serie.values[gi] ?? 0) }}</text>
        </g>
      </template>
      <text
        :x="padL + gi * groupW + groupW / 2"
        :y="padT + chartH + 18"
        class="ff-xlabel"
      >{{ label }}</text>
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
.ff-bar { width: 100%; height: auto; max-height: 360px; display: block; }
.ff-axis { stroke: var(--muted); stroke-width: 1; opacity: 0.4; }
.ff-val { font-family: 'Ubuntu Mono', monospace; font-size: 9px; fill: var(--muted); text-anchor: middle; }
.ff-xlabel { font-family: 'Ubuntu Mono', monospace; font-size: 11px; fill: var(--ink); text-anchor: middle; }
.ff-legend { font-family: 'Ubuntu Mono', monospace; font-size: 11px; fill: var(--ink); dominant-baseline: middle; }
</style>
