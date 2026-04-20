<script setup lang="ts">
const chartWidth = 720
const chartHeight = 300
const padding = { top: 28, right: 24, bottom: 48, left: 64 }
const innerWidth = chartWidth - padding.left - padding.right
const innerHeight = chartHeight - padding.top - padding.bottom
const minValue = -25
const maxValue = 40

const data = [
  { label: 'unterstes Zehntel', value: -23.8, note: 'verschuldet sich im Durchschnitt um 201 Euro im Monat' },
  { label: 'Mitte', value: 12.5, note: 'spart etwa 10 bis 15 %' },
  { label: '9. Zehntel', value: 23.6, note: 'spart rund 1.069 Euro im Monat' },
  { label: 'oberstes Zehntel', value: 37.5, note: 'spart rund 2.687 Euro im Monat' },
]

const ticks = [-25, 0, 20, 40]
const zeroY = yFor(0)
const barWidth = 92

function yFor(value: number) {
  return padding.top + ((maxValue - value) / (maxValue - minValue)) * innerHeight
}

function xFor(index: number) {
  const gap = innerWidth / data.length
  return padding.left + gap * index + gap / 2
}

function barY(value: number) {
  return value >= 0 ? yFor(value) : zeroY
}

function barHeight(value: number) {
  return Math.abs(yFor(value) - zeroY)
}
</script>

<template>
  <figure
    class="chart"
    role="img"
    aria-label="Balkengrafik zur Sparquote nach Einkommensgruppen: unterstes Zehntel minus 23,8 Prozent, Mitte etwa 12,5 Prozent, neuntes Zehntel 23,6 Prozent, oberstes Zehntel 37,5 Prozent."
  >
    <figcaption class="chart__title">
      Wer viel hat, nimmt mehr aus dem laufenden Konsum heraus
    </figcaption>
    <p class="chart__subtitle">
      Sparquote nach Einkommensgruppen. Negative Werte bedeuten: Diese Haushalte geben im Durchschnitt mehr aus, als sie einnehmen.
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
        :key="`label-${tick}`"
        class="chart__axis-label"
        :x="padding.left - 8"
        :y="yFor(tick) + 4"
        text-anchor="end"
      >
        {{ tick }} %
      </text>
      <line
        class="chart__zero"
        :x1="padding.left"
        :x2="chartWidth - padding.right"
        :y1="zeroY"
        :y2="zeroY"
      />

      <g
        v-for="(item, index) in data"
        :key="item.label"
      >
        <rect
          :class="['chart__bar', { 'chart__bar--negative': item.value < 0 }]"
          :x="xFor(index) - barWidth / 2"
          :y="barY(item.value)"
          :width="barWidth"
          :height="barHeight(item.value)"
          rx="4"
        />
        <text
          class="chart__value"
          :x="xFor(index)"
          :y="item.value >= 0 ? yFor(item.value) - 8 : yFor(item.value) + 18"
          text-anchor="middle"
        >
          {{ item.value > 0 ? '+' : '' }}{{ item.value.toString().replace('.', ',') }} %
        </text>
        <text
          class="chart__label"
          :x="xFor(index)"
          :y="chartHeight - 26"
          text-anchor="middle"
        >
          {{ item.label }}
        </text>
      </g>
    </svg>

    <ul class="chart__notes">
      <li
        v-for="item in data"
        :key="item.note"
      >
        <strong>{{ item.label }}:</strong> {{ item.note }}
      </li>
    </ul>

    <p class="chart__source">
      Quelle:
      <a
        href="https://www.diw.de/de/diw_01.c.579700.de/publikationen/wochenberichte/2018_10_3/konsum_und_sparquote_der_privaten_haushalte_haengen_stark_vom_erwerbsstatus__einkommen_und_alter_ab.html"
        target="_blank"
        rel="noopener noreferrer"
      >DIW Wochenbericht 10/2018</a>, Datenbasis EVS 2013. Die Mitte ist als Spannweite 10 bis 15 Prozent im Artikel genannt und hier als Mittelwert dargestellt.
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

.chart__zero {
  stroke: var(--ink);
  stroke-width: 1.2;
}

.chart__axis-label,
.chart__value,
.chart__label {
  font-family: 'Ubuntu Mono', monospace;
  fill: var(--muted);
}

.chart__axis-label,
.chart__label {
  font-size: 11px;
}

.chart__value {
  font-size: 12px;
  font-weight: 700;
  fill: var(--ink);
}

.chart__bar {
  fill: var(--flame);
}

.chart__bar--negative {
  fill: var(--ember);
}

.chart__notes {
  margin: 0.65rem 0 0;
  padding-left: 1.1rem;
  font-size: 0.86rem;
  line-height: 1.55;
  color: var(--muted);
}
</style>
