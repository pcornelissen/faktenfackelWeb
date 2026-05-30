<script setup lang="ts">
import type { Component } from 'vue'
import { computed } from 'vue'
import type { Serie } from './charts/shared'
import { formatValue } from './charts/shared'
import BarChart from './charts/BarChart.vue'
import LineChart from './charts/LineChart.vue'
import AreaChart from './charts/AreaChart.vue'
import PieChart from './charts/PieChart.vue'

const props = withDefaults(defineProps<{
  type: string
  alt: string
  title?: string
  subtitle?: string
  unit?: string
  stacked?: boolean
  donut?: boolean
  labels?: string[]
  series?: Serie[]
}>(), {
  title: '', subtitle: '', unit: '', stacked: false, donut: false,
  labels: () => [], series: () => [],
})

const renderers: Record<string, Component> = { bar: BarChart, line: LineChart, area: AreaChart, pie: PieChart }

// max. 6 Serien: darüber bricht die einzeilige Legende aus dem viewBox.
const valid = computed(() =>
  props.labels.length > 0
  && props.series.length > 0
  && props.series.length <= 6
  && props.series.every(s =>
    Array.isArray(s.values)
    && s.values.length === props.labels.length
    && s.values.every(v => typeof v === 'number' && Number.isFinite(v)),
  )
  && !!renderers[props.type],
)
</script>

<template>
  <figure
    class="ff-chart"
    role="img"
    :aria-label="alt"
  >
    <figcaption
      v-if="title || subtitle"
      class="ff-chart-cap"
    >
      <strong v-if="title">{{ title }}</strong>
      <span
        v-if="subtitle"
        class="ff-chart-sub"
      >{{ subtitle }}</span>
    </figcaption>

    <component
      :is="renderers[type]"
      v-if="valid"
      :labels="labels"
      :series="series"
      :unit="unit"
      :stacked="stacked"
      :donut="donut"
    />
    <p
      v-else
      class="ff-chart-error"
    >
      Diagramm konnte nicht dargestellt werden (Daten unvollständig oder Typ unbekannt).
    </p>

    <table
      v-if="valid"
      class="ff-chart-sr"
    >
      <caption>{{ title || alt }}</caption>
      <thead>
        <tr>
          <th />
          <th
            v-for="(l, i) in labels"
            :key="i"
          >
            {{ l }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(s, si) in series"
          :key="si"
        >
          <th>{{ s.label }}</th>
          <td
            v-for="(v, vi) in s.values"
            :key="vi"
          >
            {{ formatValue(v, unit) }}
          </td>
        </tr>
      </tbody>
    </table>
  </figure>
</template>

<style scoped>
.ff-chart { margin: 1.5rem 0; padding: 1.25rem; border: 1px solid var(--fackel-border); border-radius: 0.5rem; background: var(--paper); }
.ff-chart-cap { display: block; margin-bottom: 0.75rem; font-family: 'Playfair Display', serif; }
.ff-chart-cap strong { display: block; font-size: 1.05rem; color: var(--ink); }
.ff-chart-sub { display: block; margin-top: 0.25rem; font-family: 'Source Serif 4', serif; font-size: 0.85rem; color: var(--muted); }
.ff-chart-error { font-family: 'Ubuntu Mono', monospace; font-size: 0.8rem; color: var(--muted); }
.ff-chart-sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
</style>
