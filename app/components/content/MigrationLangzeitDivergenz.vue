<script setup lang="ts">
interface YearPoint {
  year: number
  auslaender: number
  kriminalitaet: number
}

const data: YearPoint[] = [
  { year: 2005, auslaender: 100, kriminalitaet: 100 },
  { year: 2010, auslaender: 103, kriminalitaet: 89 },
  { year: 2015, auslaender: 134, kriminalitaet: 94 },
  { year: 2019, auslaender: 153, kriminalitaet: 83 },
  { year: 2020, auslaender: 155, kriminalitaet: 79 },
  { year: 2022, auslaender: 163, kriminalitaet: 85 },
  { year: 2024, auslaender: 170, kriminalitaet: 86 },
]

const yearIndex = ref(0)
const current = computed(() => data[yearIndex.value]!)
const auslaenderDelta = computed(() => current.value.auslaender - 100)
const kriminalitaetDelta = computed(() => current.value.kriminalitaet - 100)

const viewW = 580
const viewH = 280
const padL = 50
const padR = 80
const padT = 40
const padB = 40
const chartW = viewW - padL - padR
const chartH = viewH - padT - padB

const yMin = 70
const yMax = 180
const xStart = 2005
const xEnd = 2024

function xPos(year: number) {
  return padL + ((year - xStart) / (xEnd - xStart)) * chartW
}
function yPos(val: number) {
  return padT + (1 - (val - yMin) / (yMax - yMin)) * chartH
}

const auslaenderPath = computed(() => {
  const visible = data.slice(0, yearIndex.value + 1)
  if (visible.length === 0) return ''
  return visible.map((p, i) => `${i === 0 ? 'M' : 'L'}${xPos(p.year).toFixed(1)},${yPos(p.auslaender).toFixed(1)}`).join(' ')
})
const kriminalitaetPath = computed(() => {
  const visible = data.slice(0, yearIndex.value + 1)
  if (visible.length === 0) return ''
  return visible.map((p, i) => `${i === 0 ? 'M' : 'L'}${xPos(p.year).toFixed(1)},${yPos(p.kriminalitaet).toFixed(1)}`).join(' ')
})

const yTicks = [80, 100, 120, 140, 160, 180]

function next() {
  if (yearIndex.value < data.length - 1) yearIndex.value++
}
function prev() {
  if (yearIndex.value > 0) yearIndex.value--
}
function reset() {
  yearIndex.value = 0
}
function playAll() {
  yearIndex.value = 0
  const iv = setInterval(() => {
    if (yearIndex.value >= data.length - 1) {
      clearInterval(iv)
      return
    }
    yearIndex.value++
  }, 700)
}
</script>

<template>
  <figure class="divergenz-figure">
    <figcaption class="divergenz-caption">
      <strong>Wenn Migration Kriminalität treibt, müsste diese Kurve anders aussehen</strong>
      <span class="divergenz-sub">Entwicklung 2005 bis 2024: Ausländerzahl in Deutschland (indexiert auf 2005 = 100) gegen Kriminalitätsrate je 100.000 Einwohner (indexiert auf 2005 = 100).</span>
    </figcaption>

    <div class="divergenz-chart">
      <svg
        :viewBox="`0 0 ${viewW} ${viewH}`"
        class="divergenz-svg"
        role="img"
        aria-label="Liniendiagramm Ausländerzahl vs. Kriminalitätsrate 2005-2024"
      >
        <!-- Grid -->
        <line
          v-for="t in yTicks"
          :key="`yg-${t}`"
          :x1="padL"
          :x2="padL + chartW"
          :y1="yPos(t)"
          :y2="yPos(t)"
          class="divergenz-grid"
        />
        <text
          v-for="t in yTicks"
          :key="`yl-${t}`"
          :x="padL - 8"
          :y="yPos(t)"
          class="divergenz-ytick"
        >{{ t }}</text>

        <!-- Baseline 100 -->
        <line
          :x1="padL"
          :x2="padL + chartW"
          :y1="yPos(100)"
          :y2="yPos(100)"
          class="divergenz-baseline"
        />
        <text
          :x="padL + chartW + 6"
          :y="yPos(100)"
          class="divergenz-baseline-label"
        >100 (2005)</text>

        <!-- X axis labels -->
        <text
          v-for="p in data"
          :key="`xl-${p.year}`"
          :x="xPos(p.year)"
          :y="viewH - padB + 18"
          class="divergenz-xtick"
        >{{ p.year }}</text>

        <!-- Lines -->
        <path
          :d="auslaenderPath"
          class="divergenz-line divergenz-line-auslaender"
        />
        <path
          :d="kriminalitaetPath"
          class="divergenz-line divergenz-line-kriminalitaet"
        />

        <!-- Current point markers -->
        <circle
          :cx="xPos(current.year)"
          :cy="yPos(current.auslaender)"
          r="5"
          class="divergenz-dot divergenz-dot-auslaender"
        />
        <circle
          :cx="xPos(current.year)"
          :cy="yPos(current.kriminalitaet)"
          r="5"
          class="divergenz-dot divergenz-dot-kriminalitaet"
        />

        <!-- Legend -->
        <g :transform="`translate(${padL + 10}, ${padT + 10})`">
          <rect
            width="11"
            height="11"
            class="divergenz-legend-swatch-auslaender"
          />
          <text
            x="18"
            y="10"
            class="divergenz-legend-label"
          >Ausländerzahl</text>
          <rect
            y="20"
            width="11"
            height="11"
            class="divergenz-legend-swatch-kriminalitaet"
          />
          <text
            x="18"
            y="30"
            class="divergenz-legend-label"
          >Kriminalitätsrate</text>
        </g>
      </svg>
    </div>

    <div class="divergenz-step">
      <div class="divergenz-step-header">
        <span class="divergenz-step-num">Stand {{ current.year }}</span>
      </div>
      <div class="divergenz-values">
        <div class="divergenz-value">
          <span class="divergenz-value-label">Ausländerzahl</span>
          <span class="divergenz-value-number">{{ current.auslaender }}</span>
          <span
            class="divergenz-value-delta"
            :class="{ pos: auslaenderDelta > 0, neg: auslaenderDelta < 0 }"
          >
            {{ auslaenderDelta >= 0 ? '+' : '' }}{{ auslaenderDelta }}&nbsp;% seit 2005
          </span>
        </div>
        <div class="divergenz-value">
          <span class="divergenz-value-label">Kriminalitätsrate</span>
          <span class="divergenz-value-number">{{ current.kriminalitaet }}</span>
          <span
            class="divergenz-value-delta"
            :class="{ pos: kriminalitaetDelta > 0, neg: kriminalitaetDelta < 0 }"
          >
            {{ kriminalitaetDelta >= 0 ? '+' : '' }}{{ kriminalitaetDelta }}&nbsp;% seit 2005
          </span>
        </div>
      </div>
    </div>

    <div class="divergenz-controls">
      <button
        type="button"
        class="divergenz-btn"
        :disabled="yearIndex === 0"
        @click="prev"
      >
        ← Zurück
      </button>
      <button
        type="button"
        class="divergenz-btn divergenz-btn-primary"
        :disabled="yearIndex === data.length - 1"
        @click="next"
      >
        Weiter →
      </button>
      <button
        type="button"
        class="divergenz-btn"
        @click="playAll"
      >
        ▶ Abspielen
      </button>
      <button
        type="button"
        class="divergenz-btn divergenz-btn-ghost"
        @click="reset"
      >
        Zurücksetzen
      </button>
    </div>

    <p class="divergenz-cite">
      Datengrundlage: BKA-PKS-Zeitreihen (Straftaten je 100.000 Einwohner, ohne ausländerrechtliche Verstöße) und Statistisches Bundesamt (Mikrozensus Ausländeranteil). Dargestellt indexiert auf 2005 = 100.
    </p>
  </figure>
</template>

<style scoped>
.divergenz-figure {
  margin: 2rem 0;
  padding: 1.5rem;
  border: 1px solid var(--fackel-border);
  border-radius: 0.5rem;
  background: var(--paper);
}

.divergenz-caption {
  display: block;
  margin-bottom: 1.25rem;
  font-family: 'Playfair Display', serif;
}
.divergenz-caption strong {
  display: block;
  font-size: 1.15rem;
  color: var(--ink);
}
.divergenz-sub {
  display: block;
  margin-top: 0.25rem;
  font-family: 'Source Serif 4', serif;
  font-size: 0.9rem;
  color: var(--muted);
}

.divergenz-chart {
  margin: 1rem 0 1.25rem;
}
.divergenz-svg {
  width: 100%;
  height: auto;
  max-height: 320px;
  display: block;
}
.divergenz-grid {
  stroke: var(--fackel-border);
  stroke-width: 1;
}
.divergenz-baseline {
  stroke: var(--muted);
  stroke-width: 1;
  stroke-dasharray: 4 4;
  opacity: 0.6;
}
.divergenz-baseline-label {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 11px;
  fill: var(--muted);
  dominant-baseline: middle;
}
.divergenz-ytick {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 11px;
  fill: var(--muted);
  text-anchor: end;
  dominant-baseline: middle;
}
.divergenz-xtick {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 11px;
  fill: var(--muted);
  text-anchor: middle;
}
.divergenz-line {
  fill: none;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: d 0.5s ease;
}
.divergenz-line-auslaender {
  stroke: var(--ember);
}
.divergenz-line-kriminalitaet {
  stroke: var(--flame);
}
.divergenz-dot {
  transition: cx 0.5s ease, cy 0.5s ease;
}
.divergenz-dot-auslaender {
  fill: var(--ember);
}
.divergenz-dot-kriminalitaet {
  fill: var(--flame);
}
.divergenz-legend-swatch-auslaender {
  fill: var(--ember);
}
.divergenz-legend-swatch-kriminalitaet {
  fill: var(--flame);
}
.divergenz-legend-label {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 11px;
  fill: var(--ink);
  dominant-baseline: middle;
}

.divergenz-step {
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(249, 140, 53, 0.08);
  border-left: 3px solid var(--flame);
  border-radius: 0 0.25rem 0.25rem 0;
}
.divergenz-step-header {
  margin-bottom: 0.5rem;
}
.divergenz-step-num {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.8rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.divergenz-values {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}
.divergenz-value {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.divergenz-value-label {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.divergenz-value-number {
  font-family: 'Playfair Display', serif;
  font-weight: 700;
  font-size: 1.5rem;
  color: var(--ink);
  line-height: 1.1;
}
.divergenz-value-delta {
  font-family: 'Source Serif 4', serif;
  font-size: 0.9rem;
  color: var(--muted);
}
.divergenz-value-delta.pos {
  color: var(--ember);
}
.divergenz-value-delta.neg {
  color: #2e7d32;
}

.divergenz-controls {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}
.divergenz-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--fackel-border);
  border-radius: 0.25rem;
  background: #fff;
  color: var(--ink);
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.divergenz-btn:hover:not(:disabled) {
  border-color: var(--flame);
  background: rgba(249, 140, 53, 0.08);
}
.divergenz-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.divergenz-btn-primary {
  background: var(--flame);
  border-color: var(--flame);
  color: #fff;
}
.divergenz-btn-primary:hover:not(:disabled) {
  background: var(--ember);
  border-color: var(--ember);
}
.divergenz-btn-ghost {
  background: transparent;
  color: var(--muted);
}

.divergenz-cite {
  margin: 0;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  color: var(--muted);
}

@media (prefers-reduced-motion: reduce) {
  .divergenz-line,
  .divergenz-dot {
    transition: none;
  }
}
</style>
