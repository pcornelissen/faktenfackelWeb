<script setup lang="ts">
import { computed } from 'vue'
import { arc as d3arc, pie as d3pie } from 'd3-shape'
import type { Serie } from '../charts/shared'
import { colorFor, formatValue } from '../charts/shared'

const props = withDefaults(defineProps<{
  labels: string[]
  series: Serie[]
  unit?: string
  stacked?: boolean
  donut?: boolean
}>(), { unit: '', stacked: false, donut: false })

const viewW = 640
const viewH = 280
const cx = 150
const cy = 130
const R = 110

// Kreis-/Donut-Diagramm nutzt bewusst nur die erste Serie (ein Wert je Label = eine Scheibe).
const values = computed(() => props.labels.map((_, i) => props.series[0]?.values[i] ?? 0))
const total = computed(() => values.value.reduce((a, b) => a + b, 0))

const arcs = computed(() => {
  const gen = d3pie<number>().sort(null).value(v => v)(values.value)
  const arcGen = d3arc<typeof gen[number]>()
    .innerRadius(props.donut ? R * 0.58 : 0)
    .outerRadius(R)
  return gen.map((a, i) => ({
    d: arcGen(a) ?? '',
    color: colorFor(i),
    label: props.labels[i] ?? '',
    value: values.value[i] ?? 0,
  }))
})

function pct(v: number) {
  return total.value ? (v / total.value) * 100 : 0
}
function fmt(v: number) {
  return formatValue(v, props.unit)
}
</script>

<template>
  <svg
    :viewBox="`0 0 ${viewW} ${viewH}`"
    class="ff-pie"
    aria-hidden="true"
  >
    <g :transform="`translate(${cx}, ${cy})`">
      <path
        v-for="(a, ai) in arcs"
        :key="ai"
        :d="a.d"
        :fill="a.color"
        stroke="var(--paper)"
        stroke-width="1.5"
      />
    </g>
    <g :transform="`translate(${cx + R + 40}, 28)`">
      <g
        v-for="(a, ai) in arcs"
        :key="ai"
        :transform="`translate(0, ${ai * 26})`"
      >
        <rect
          width="12"
          height="12"
          :fill="a.color"
        />
        <text
          x="18"
          y="10"
          class="ff-legend"
        >{{ a.label }}: {{ fmt(a.value) }} ({{ pct(a.value).toFixed(0) }} %)</text>
      </g>
    </g>
  </svg>
</template>

<style scoped>
.ff-pie { width: 100%; height: auto; max-height: 320px; display: block; }
.ff-legend { font-family: 'Ubuntu Mono', monospace; font-size: 12px; fill: var(--ink); dominant-baseline: middle; }
</style>
