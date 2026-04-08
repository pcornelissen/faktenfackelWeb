<script setup lang="ts">
type BurdenPoint = {
  key: string
  label: string
  value: number
  color: string
}

const points: BurdenPoint[] = [
  {
    key: '2018-all',
    label: '2018\nalle Mieterhaushalte',
    value: 27.2,
    color: '#B53A10',
  },
  {
    key: '2018-new',
    label: '2018\nneu angemietet',
    value: 28.6,
    color: '#E56B2E',
  },
  {
    key: '2022-all',
    label: '2022\nalle Mieterhaushalte',
    value: 27.8,
    color: '#8A7D6A',
  },
  {
    key: '2022-new',
    label: '2022\nneu angemietet',
    value: 29.5,
    color: '#4F463D',
  },
]

const chartWidth = 760
const chartHeight = 320
const padding = {
  top: 20,
  right: 20,
  bottom: 64,
  left: 48,
}

const maxValue = 35
const yTicks = [0, 10, 20, 30]
const innerWidth = chartWidth - padding.left - padding.right
const innerHeight = chartHeight - padding.top - padding.bottom
const step = innerWidth / points.length
const barWidth = Math.min(86, step * 0.58)

const yFor = (value: number) =>
  padding.top + innerHeight - (value / maxValue) * innerHeight

const xFor = (index: number) =>
  padding.left + step * index + step / 2 - barWidth / 2
</script>

<template>
  <figure
    class="chart-figure"
    role="img"
    aria-label="Balkengrafik zur Mietbelastungsquote von Mieterhaushalten in Deutschland 2018 und 2022"
  >
    <figcaption class="chart-figure__title">
      Immer mehr vom Einkommen geht für Miete drauf
    </figcaption>

    <p class="chart-figure__subtitle">
      Gezeigt wird die Mietbelastungsquote, also der Anteil der Bruttokaltmiete am Haushaltsnettoeinkommen.
    </p>

    <svg
      class="chart-figure__svg"
      :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
      preserveAspectRatio="xMidYMid meet"
    >
      <line
        v-for="tick in yTicks"
        :key="`grid-${tick}`"
        class="chart-figure__grid"
        :x1="padding.left"
        :x2="chartWidth - padding.right"
        :y1="yFor(tick)"
        :y2="yFor(tick)"
      />

      <text
        v-for="tick in yTicks"
        :key="`ylabel-${tick}`"
        class="chart-figure__axis-label"
        :x="padding.left - 8"
        :y="yFor(tick) + 4"
        text-anchor="end"
      >
        {{ tick }} %
      </text>

      <g
        v-for="(point, index) in points"
        :key="point.key"
      >
        <rect
          class="chart-figure__track"
          :x="xFor(index)"
          :y="padding.top"
          :width="barWidth"
          :height="innerHeight"
          rx="4"
        />
        <rect
          class="chart-figure__bar"
          :x="xFor(index)"
          :y="yFor(point.value)"
          :width="barWidth"
          :height="chartHeight - padding.bottom - yFor(point.value)"
          rx="4"
          :style="{ fill: point.color }"
        />

        <text
          class="chart-figure__value"
          :x="xFor(index) + barWidth / 2"
          :y="yFor(point.value) - 8"
          text-anchor="middle"
        >
          {{ String(point.value).replace('.', ',') }} %
        </text>

        <text
          class="chart-figure__x-label"
          :x="xFor(index) + barWidth / 2"
          :y="chartHeight - padding.bottom + 22"
          text-anchor="middle"
        >
          <tspan
            v-for="(line, lineIndex) in point.label.split('\n')"
            :key="`${point.key}-${lineIndex}`"
            :x="xFor(index) + barWidth / 2"
            :dy="lineIndex === 0 ? 0 : 14"
          >
            {{ line }}
          </tspan>
        </text>
      </g>
    </svg>

    <p class="chart-figure__note">
      Quellen:
      <a
        href="https://www.destatis.de/DE/Presse/Pressemitteilungen/2019/10/PD19_N001_129.html"
        target="_blank"
        rel="noopener noreferrer"
      >Destatis, Wohnen 2018: Mieten und Mietbelastung in Metropolen besonders hoch</a>
      sowie
      <a
        href="https://www.destatis.de/DE/Presse/Pressemitteilungen/2023/03/PD23_129_12_63.html"
        target="_blank"
        rel="noopener noreferrer"
      >Destatis, Haushalte wendeten 2022 durchschnittlich 27,8 % ihres Einkommens für die Miete auf</a>.
    </p>

    <p class="chart-figure__note">
      Hinweis: "Neu angemietet" meint 2018 Wohnungen mit Einzug ab 2015, 2022 Wohnungen mit Einzug ab 2019. Die Jahre sind deshalb gut vergleichbar, aber nicht vollkommen identisch definiert.
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
  margin: 0 0 0.85rem;
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

.chart-figure__axis-label,
.chart-figure__x-label,
.chart-figure__value {
  font-family: 'Ubuntu Mono', monospace;
}

.chart-figure__axis-label {
  font-size: 11px;
  fill: var(--muted);
}

.chart-figure__x-label {
  font-size: 11px;
  fill: var(--muted);
}

.chart-figure__track {
  fill: #eee7dc;
}

.chart-figure__value {
  font-size: 12px;
  font-weight: 700;
  fill: var(--ink);
}

.chart-figure__note {
  margin: 0.85rem 0 0;
  font-size: 0.82rem;
  line-height: 1.55;
  color: var(--muted);
}
</style>
