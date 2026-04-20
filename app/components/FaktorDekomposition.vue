<script setup lang="ts">
interface Step {
  factor: number
  label: string
  desc: string
  citation: string
}

const props = withDefaults(defineProps<{
  title: string
  subtitle?: string
  baselineLabel: string
  targetLabel: string
  steps: Step[]
  maxFactor?: number
}>(), {
  maxFactor: undefined,
  subtitle: '',
})

const resolvedMax = computed(() => props.maxFactor ?? Math.max(...props.steps.map(s => s.factor)))
const stepIndex = ref(0)
const current = computed(() => props.steps[stepIndex.value]!)

const barMaxPx = 460
const barOffsetX = 12
const germanBarPx = computed(() => barMaxPx / resolvedMax.value)
const foreignBarPx = computed(() => current.value.factor * germanBarPx.value)

function next() {
  if (stepIndex.value < props.steps.length - 1) stepIndex.value++
}
function prev() {
  if (stepIndex.value > 0) stepIndex.value--
}
function reset() {
  stepIndex.value = 0
}
</script>

<template>
  <figure class="tvbz-figure">
    <figcaption class="tvbz-caption">
      <strong>{{ title }}</strong>
      <span
        v-if="subtitle"
        class="tvbz-sub"
      >{{ subtitle }}</span>
    </figcaption>

    <div class="tvbz-chart">
      <svg
        viewBox="0 0 580 180"
        class="tvbz-svg"
        role="img"
        :aria-label="`Balkendiagramm ${baselineLabel} vs. ${targetLabel}`"
      >
        <line
          :x1="barOffsetX + germanBarPx"
          y1="20"
          :x2="barOffsetX + germanBarPx"
          y2="160"
          class="tvbz-baseline"
        />

        <text
          :x="barOffsetX"
          y="40"
          class="tvbz-label"
        >{{ baselineLabel }}</text>
        <rect
          :x="barOffsetX"
          y="50"
          :width="germanBarPx"
          height="28"
          class="tvbz-bar tvbz-bar-de"
        />
        <text
          :x="barOffsetX + germanBarPx + 10"
          y="69"
          class="tvbz-value"
        >Faktor 1,0</text>

        <text
          :x="barOffsetX"
          y="110"
          class="tvbz-label"
        >{{ targetLabel }}</text>
        <rect
          :x="barOffsetX"
          y="120"
          :width="foreignBarPx"
          height="28"
          class="tvbz-bar tvbz-bar-au"
        />
        <text
          :x="barOffsetX + foreignBarPx + 10"
          y="139"
          class="tvbz-value"
        >Faktor {{ current.factor.toFixed(1).replace('.', ',') }}</text>
      </svg>
    </div>

    <div class="tvbz-step">
      <div class="tvbz-step-header">
        <span class="tvbz-step-num">Schritt {{ stepIndex + 1 }} / {{ steps.length }}</span>
        <span class="tvbz-step-label">{{ current.label }}</span>
      </div>
      <p class="tvbz-desc">
        {{ current.desc }}
      </p>
      <p class="tvbz-cite">
        Datengrundlage: {{ current.citation }}
      </p>
    </div>

    <div class="tvbz-controls">
      <button
        type="button"
        class="tvbz-btn"
        :disabled="stepIndex === 0"
        @click="prev"
      >
        ← Zurück
      </button>
      <button
        type="button"
        class="tvbz-btn tvbz-btn-primary"
        :disabled="stepIndex === steps.length - 1"
        @click="next"
      >
        Weiter →
      </button>
      <button
        type="button"
        class="tvbz-btn tvbz-btn-ghost"
        @click="reset"
      >
        Zurücksetzen
      </button>
    </div>
  </figure>
</template>

<style scoped>
.tvbz-figure {
  margin: 2rem 0;
  padding: 1.5rem;
  border: 1px solid var(--fackel-border);
  border-radius: 0.5rem;
  background: var(--paper);
}

.tvbz-caption {
  display: block;
  margin-bottom: 1.25rem;
  font-family: 'Playfair Display', serif;
}
.tvbz-caption strong {
  display: block;
  font-size: 1.15rem;
  color: var(--ink);
}
.tvbz-sub {
  display: block;
  margin-top: 0.25rem;
  font-family: 'Source Serif 4', serif;
  font-size: 0.9rem;
  color: var(--muted);
}

.tvbz-chart {
  margin: 1rem 0 1.25rem;
}
.tvbz-svg {
  width: 100%;
  height: auto;
  max-height: 220px;
  display: block;
}
.tvbz-label {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 14px;
  fill: var(--ink);
  font-weight: 700;
}
.tvbz-value {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 14px;
  fill: var(--ink);
  dominant-baseline: middle;
}
.tvbz-bar {
  transition: width 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}
.tvbz-bar-de {
  fill: var(--flame);
}
.tvbz-bar-au {
  fill: var(--ember);
}
.tvbz-baseline {
  stroke: var(--muted);
  stroke-width: 1;
  stroke-dasharray: 4 4;
  opacity: 0.5;
}

.tvbz-step {
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(249, 140, 53, 0.08);
  border-left: 3px solid var(--flame);
  border-radius: 0 0.25rem 0.25rem 0;
}
.tvbz-step-header {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}
.tvbz-step-num {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.8rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.tvbz-step-label {
  font-family: 'Playfair Display', serif;
  font-weight: 700;
  color: var(--ink);
  font-size: 1.05rem;
}
.tvbz-desc {
  margin: 0 0 0.5rem;
  font-family: 'Source Serif 4', serif;
  color: var(--ink);
  line-height: 1.5;
}
.tvbz-cite {
  margin: 0;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.8rem;
  color: var(--muted);
}

.tvbz-controls {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.tvbz-btn {
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
.tvbz-btn:hover:not(:disabled) {
  border-color: var(--flame);
  background: rgba(249, 140, 53, 0.08);
}
.tvbz-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.tvbz-btn-primary {
  background: var(--flame);
  border-color: var(--flame);
  color: #fff;
}
.tvbz-btn-primary:hover:not(:disabled) {
  background: var(--ember);
  border-color: var(--ember);
}
.tvbz-btn-ghost {
  background: transparent;
  color: var(--muted);
}

@media (prefers-reduced-motion: reduce) {
  .tvbz-bar {
    transition: none;
  }
}
</style>
