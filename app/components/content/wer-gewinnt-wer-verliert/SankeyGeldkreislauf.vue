<script setup lang="ts">
import { ref, computed } from 'vue'
import { sankey as d3Sankey, sankeyLinkHorizontal } from 'd3-sankey'
import type { SankeyGraph, SankeyLink as D3SankeyLink, SankeyNode as D3SankeyNode } from 'd3-sankey'

// Datenmodell
// Drei Zeitabschnitte hintereinandergeschaltet. Die Flusswerte jeder Phase sind auf das
// skaliert, was aus der vorherigen Era an Haushalte zurückgekehrt ist:
// Start 100, 1975: 90 zurück, 2007: 68,4 zurück, 2025: 47,9 zurück.
// Werte didaktisch normiert. Proportionen orientieren sich an WSI-Lohnquote,
// TJN-Gewinnverlagerung, Bundesbank-Sparquote und öffentlicher Investitionsquote.

type NodeCategory = 'source' | 'flow' | 'leak'
type ScenarioId = '1975' | '2007' | '2025'

interface NodeDef {
  id: string
  label: string
  category: NodeCategory
}

interface FlowDef {
  source: string
  target: string
  value: number
}

const NODES: NodeDef[] = [
  { id: 'hh_start', label: 'Haushalte', category: 'source' },
  // 1975
  { id: 'firmen_75', label: 'Firmen', category: 'flow' },
  { id: 'fm_75', label: 'Finanzmarkt', category: 'leak' },
  { id: 'loehne_75', label: 'Löhne', category: 'flow' },
  { id: 'staat_75', label: 'Staat', category: 'flow' },
  { id: 'ausland_75', label: 'Ausland', category: 'leak' },
  { id: 'hh_75', label: 'Haushalte', category: 'source' },
  // 2007
  { id: 'firmen_07', label: 'Firmen', category: 'flow' },
  { id: 'fm_07', label: 'Finanzmarkt', category: 'leak' },
  { id: 'loehne_07', label: 'Löhne', category: 'flow' },
  { id: 'staat_07', label: 'Staat', category: 'flow' },
  { id: 'ausland_07', label: 'Ausland', category: 'leak' },
  { id: 'hh_07', label: 'Haushalte', category: 'source' },
  // 2025
  { id: 'firmen_25', label: 'Firmen', category: 'flow' },
  { id: 'fm_25', label: 'Finanzmarkt', category: 'leak' },
  { id: 'loehne_25', label: 'Löhne', category: 'flow' },
  { id: 'staat_25', label: 'Staat', category: 'flow' },
  { id: 'ausland_25', label: 'Ausland', category: 'leak' },
  { id: 'hh_end', label: 'Haushalte', category: 'source' },
]

const ALL_FLOWS: FlowDef[] = [
  // 1975: Start 100, Lecks 10, Rücklauf 90
  { source: 'hh_start', target: 'firmen_75', value: 96 },
  { source: 'hh_start', target: 'fm_75', value: 4 },
  { source: 'firmen_75', target: 'loehne_75', value: 72 },
  { source: 'firmen_75', target: 'staat_75', value: 18 },
  { source: 'firmen_75', target: 'ausland_75', value: 3 },
  { source: 'firmen_75', target: 'fm_75', value: 3 },
  { source: 'loehne_75', target: 'hh_75', value: 72 },
  { source: 'staat_75', target: 'hh_75', value: 18 },
  // 2007: Start 90 (skaliert), Lecks 21,6, Rücklauf 68,4
  { source: 'hh_75', target: 'firmen_07', value: 79.2 },
  { source: 'hh_75', target: 'fm_07', value: 10.8 },
  { source: 'firmen_07', target: 'loehne_07', value: 56.7 },
  { source: 'firmen_07', target: 'staat_07', value: 11.7 },
  { source: 'firmen_07', target: 'ausland_07', value: 4.5 },
  { source: 'firmen_07', target: 'fm_07', value: 6.3 },
  { source: 'loehne_07', target: 'hh_07', value: 56.7 },
  { source: 'staat_07', target: 'hh_07', value: 11.7 },
  // 2025: Start 68,4 (skaliert), Lecks 20,5, Rücklauf 47,9
  { source: 'hh_07', target: 'firmen_25', value: 56.8 },
  { source: 'hh_07', target: 'fm_25', value: 11.6 },
  { source: 'firmen_25', target: 'loehne_25', value: 39.7 },
  { source: 'firmen_25', target: 'staat_25', value: 8.2 },
  { source: 'firmen_25', target: 'ausland_25', value: 4.8 },
  { source: 'firmen_25', target: 'fm_25', value: 4.1 },
  { source: 'loehne_25', target: 'hh_end', value: 39.7 },
  { source: 'staat_25', target: 'hh_end', value: 8.2 },
]

const SCENARIO_NODE_IDS: Record<ScenarioId, string[]> = {
  1975: [
    'hh_start', 'firmen_75', 'fm_75', 'loehne_75', 'staat_75', 'ausland_75', 'hh_75',
  ],
  2007: [
    'hh_start', 'firmen_75', 'fm_75', 'loehne_75', 'staat_75', 'ausland_75', 'hh_75',
    'firmen_07', 'fm_07', 'loehne_07', 'staat_07', 'ausland_07', 'hh_07',
  ],
  2025: NODES.map(n => n.id),
}

const SCENARIO_SUBTITLES: Record<ScenarioId, string> = {
  1975: 'In den Wirtschaftswunderjahren floss das Geld noch relativ vollständig im Kreislauf. Von 100 Einheiten, die Haushalte ausgaben, kamen im Modell 90 zurück.',
  2007: 'Bis zur Finanzkrise hatten sich die Lecks schon vergrößert. Von den 90, die 1975 zurückkamen, kamen bis 2007 noch 68 an, kumuliert nur noch 68 von 100.',
  2025: 'Heute kumulieren drei Jahrzehnte Verluste. Von den 68, die nach 2007 übrig waren, kamen bis 2025 noch 48 zurück: weniger als die Hälfte des ursprünglichen Starts.',
}

const ERA_COUNT: Record<ScenarioId, number> = { 1975: 1, 2007: 2, 2025: 3 }

const ERA_HEADER_IDS: Record<string, string> = {
  firmen_75: '1975',
  firmen_07: 'bis 2007',
  firmen_25: 'bis 2025',
}

const selected = ref<ScenarioId>('1975')

// Sankey-Layout

interface LaidOutNode extends D3SankeyNode<NodeDef, FlowDef> {
  id: string
  label: string
  category: NodeCategory
}

interface GraphLink {
  source: number
  target: number
  value: number
}

interface LaidOutLink extends D3SankeyLink<NodeDef, GraphLink> {
  value: number
}

const HEIGHT = 360
const MARGIN = { top: 44, right: 108, bottom: 20, left: 100 }
const ERA_WIDTH = 460

const svgWidth = computed(() => ERA_COUNT[selected.value] * ERA_WIDTH)

const activeNodes = computed(() => {
  const ids = new Set(SCENARIO_NODE_IDS[selected.value])
  return NODES.filter(n => ids.has(n.id))
})

const activeFlows = computed(() => {
  const ids = new Set(SCENARIO_NODE_IDS[selected.value])
  return ALL_FLOWS.filter(f => ids.has(f.source) && ids.has(f.target))
})

function buildLayout(nodes: NodeDef[], flows: FlowDef[], width: number) {
  const nodeMap = new Map(nodes.map((n, i) => [n.id, i] as const))

  const graph: SankeyGraph<NodeDef, GraphLink> = {
    nodes: nodes.map(n => ({ ...n })),
    links: flows.map<GraphLink>(f => ({
      source: nodeMap.get(f.source)!,
      target: nodeMap.get(f.target)!,
      value: f.value,
    })),
  }

  const generator = d3Sankey<NodeDef, GraphLink>()
    .nodeWidth(12)
    .nodePadding(8)
    .extent([
      [MARGIN.left, MARGIN.top],
      [width - MARGIN.right, HEIGHT - MARGIN.bottom],
    ])

  const result = generator(graph)
  const pathFn = sankeyLinkHorizontal()
  const laidOutNodes = result.nodes as LaidOutNode[]

  return {
    nodes: laidOutNodes.map(n => ({
      ...n,
      labelX: (n.x0 ?? 0) < width / 2 ? (n.x0 ?? 0) - 6 : (n.x1 ?? 0) + 6,
      labelAnchor: ((n.x0 ?? 0) < width / 2 ? 'end' : 'start') as 'start' | 'end',
      labelY: ((n.y0 ?? 0) + (n.y1 ?? 0)) / 2,
    })),
    links: (result.links as LaidOutLink[]).map((l) => {
      const src = l.source as LaidOutNode
      const tgt = l.target as LaidOutNode
      return {
        ...l,
        path: pathFn(l as unknown as Parameters<typeof pathFn>[0]) ?? '',
        sourceId: src.id,
        targetId: tgt.id,
        targetCategory: tgt.category,
      }
    }),
  }
}

const layout = computed(() => buildLayout(activeNodes.value, activeFlows.value, svgWidth.value))

// Era-Header über den Firmen-Knoten
const eraHeaders = computed(() =>
  layout.value.nodes
    .filter(n => n.id in ERA_HEADER_IDS)
    .map(n => ({
      x: ((n.x0 ?? 0) + (n.x1 ?? 0)) / 2,
      label: ERA_HEADER_IDS[n.id]!,
    })),
)

function linkClass(targetCategory: NodeCategory, targetId: string): string {
  if (targetCategory === 'leak') return 'sankey__link sankey__link--leak'
  if (targetId === 'hh_75' || targetId === 'hh_07' || targetId === 'hh_end') {
    return 'sankey__link sankey__link--return'
  }
  return 'sankey__link sankey__link--flow'
}

function nodeClass(category: NodeCategory): string {
  switch (category) {
    case 'leak': return 'sankey__node sankey__node--leak'
    case 'source': return 'sankey__node sankey__node--source'
    default: return 'sankey__node sankey__node--flow'
  }
}
</script>

<template>
  <figure
    class="sankey"
    role="group"
    aria-labelledby="sankey-title"
  >
    <figcaption
      id="sankey-title"
      class="sankey__title"
    >
      Der schrumpfende Kreislauf
    </figcaption>

    <!-- Szenario-Buttons -->
    <div
      class="sankey__controls"
      role="group"
      aria-label="Zeitraum auswählen"
    >
      <button
        v-for="id in (['1975', '2007', '2025'] as ScenarioId[])"
        :key="id"
        :class="['sankey__btn', { 'sankey__btn--active': selected === id }]"
        :aria-pressed="selected === id"
        @click="selected = id"
      >
        {{ id === '1975' ? '1975' : id === '2007' ? 'bis 2007' : 'alle drei' }}
      </button>
    </div>

    <p class="sankey__subtitle">
      {{ SCENARIO_SUBTITLES[selected] }}
    </p>

    <!-- Desktop / Tablet: Sankey -->
    <div class="sankey__svg-wrap sankey__svg-wrap--full">
      <svg
        class="sankey__svg"
        role="img"
        :aria-label="`Sankey-Diagramm des deutschen Geldkreislaufs, Szenario ${selected}.`"
        :viewBox="`0 0 ${svgWidth} ${HEIGHT}`"
        preserveAspectRatio="xMidYMid meet"
      >
        <!-- Era-Header -->
        <g class="sankey__era-labels">
          <text
            v-for="h in eraHeaders"
            :key="h.label"
            class="sankey__era-label"
            :x="h.x"
            :y="MARGIN.top - 12"
            text-anchor="middle"
          >
            {{ h.label }}
          </text>
        </g>

        <g class="sankey__links">
          <path
            v-for="(link, idx) in layout.links"
            :key="`l-${idx}`"
            :class="linkClass(link.targetCategory, link.targetId)"
            :d="link.path"
            :stroke-width="Math.max(1, link.width ?? 1)"
          >
            <title>{{ (link.source as LaidOutNode).label }} → {{ (link.target as LaidOutNode).label }}: {{ link.value }}</title>
          </path>
        </g>

        <g class="sankey__nodes">
          <g
            v-for="node in layout.nodes"
            :key="node.id"
          >
            <rect
              :class="nodeClass(node.category)"
              :x="node.x0"
              :y="node.y0"
              :width="(node.x1 ?? 0) - (node.x0 ?? 0)"
              :height="Math.max(1, (node.y1 ?? 0) - (node.y0 ?? 0))"
              rx="2"
            />
            <text
              class="sankey__node-label"
              :x="node.labelX"
              :y="node.labelY"
              :text-anchor="node.labelAnchor"
              dominant-baseline="middle"
            >
              {{ node.label }}
            </text>
          </g>
        </g>
      </svg>
    </div>

    <!-- Mobile-Fallback -->
    <div
      class="sankey__mobile-summary"
      aria-hidden="true"
    >
      <div class="sankey__mobile-row">
        <span class="sankey__mobile-year">Start</span>
        <div class="sankey__mobile-bar">
          <div
            class="sankey__mobile-fill sankey__mobile-fill--source"
            style="width: 100%"
          />
        </div>
        <span class="sankey__mobile-val">100</span>
      </div>
      <div class="sankey__mobile-row">
        <span class="sankey__mobile-year">1975</span>
        <div class="sankey__mobile-bar">
          <div
            class="sankey__mobile-fill sankey__mobile-fill--flow"
            style="width: 90%"
          />
        </div>
        <span class="sankey__mobile-val">90</span>
      </div>
      <template v-if="selected !== '1975'">
        <div class="sankey__mobile-row">
          <span class="sankey__mobile-year">2007</span>
          <div class="sankey__mobile-bar">
            <div
              class="sankey__mobile-fill sankey__mobile-fill--flow"
              style="width: 68.4%"
            />
          </div>
          <span class="sankey__mobile-val">68</span>
        </div>
      </template>
      <template v-if="selected === '2025'">
        <div class="sankey__mobile-row">
          <span class="sankey__mobile-year">2025</span>
          <div class="sankey__mobile-bar">
            <div
              class="sankey__mobile-fill sankey__mobile-fill--leak"
              style="width: 47.9%"
            />
          </div>
          <span class="sankey__mobile-val">48</span>
        </div>
      </template>
    </div>

    <!-- Datentabelle als Screenreader-Fallback -->
    <details class="sankey__details">
      <summary>Anteile, die im Modell zurückfließen oder abwandern</summary>
      <table class="sankey__table">
        <caption class="sr-only">
          Anteil des Geldes, der je Abschnitt an Haushalte zurückfließt oder in Finanzmarkt und Ausland abwandert.
        </caption>
        <thead>
          <tr>
            <th scope="col">
              Jahr
            </th>
            <th scope="col">
              Zurück an Haushalte
            </th>
            <th scope="col">
              Finanzmarkt
            </th>
            <th scope="col">
              Ausland
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">
              1975
            </th>
            <td>90 %</td>
            <td>7 %</td>
            <td>3 %</td>
          </tr>
          <tr>
            <th scope="row">
              2007
            </th>
            <td>76 %</td>
            <td>19 %</td>
            <td>5 %</td>
          </tr>
          <tr>
            <th scope="row">
              2025
            </th>
            <td>70 %</td>
            <td>23 %</td>
            <td>7 %</td>
          </tr>
        </tbody>
      </table>
    </details>

    <p class="sankey__note">
      Die Werte sind ein didaktisch normiertes Modell, keine Jahresstatistik. Die Proportionen orientieren sich an WSI-Lohnquote, TJN-Gewinnverlagerungsschätzungen, Bundesbank-Sparquotendaten und öffentlicher Investitionsquote (Destatis/BMF).
    </p>
  </figure>
</template>

<style scoped>
.sankey {
  max-width: 100%;
  margin: 1.75rem 0;
  padding: 1rem 1.1rem 1.1rem;
  border: 1px solid var(--fackel-border);
  border-radius: 6px;
  background: #faf6f0;
}

.sankey__title {
  margin-bottom: 0.6rem;
  font-family: 'Playfair Display', 'Book Antiqua', Palatino, Georgia, serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ink);
}

.sankey__controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.sankey__btn {
  padding: 0.3em 0.85em;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  border: 1px solid var(--fackel-border);
  border-radius: 3px;
  background: #fff;
  color: var(--muted);
  cursor: pointer;
  transition: background 160ms, color 160ms, border-color 160ms;
}

.sankey__btn:hover {
  background: var(--fackel-border);
  color: var(--ink);
}

.sankey__btn--active {
  background: var(--smoke);
  color: var(--paper);
  border-color: var(--smoke);
}

.sankey__subtitle {
  margin: 0 0 0.9rem;
  font-size: 0.92rem;
  line-height: 1.5;
  color: var(--muted);
}

.sankey__svg-wrap { width: 100%; }
.sankey__svg-wrap--full { display: block; }

.sankey__svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.sankey__era-label {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  fill: var(--muted);
  letter-spacing: 0.04em;
}

.sankey__link {
  fill: none;
  stroke-opacity: 0.45;
}

.sankey__link--flow { stroke: var(--flame); }
.sankey__link--return { stroke: #8a7f6f; stroke-opacity: 0.35; }
.sankey__link--leak { stroke: var(--ember); stroke-opacity: 0.6; }

.sankey__link:hover { stroke-opacity: 0.75; }

.sankey__node--source { fill: var(--smoke); }
.sankey__node--flow { fill: var(--ash); }
.sankey__node--leak { fill: var(--ember); }

.sankey__node-label {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 10px;
  fill: var(--ink);
}

/* Mobile-Fallback */
.sankey__mobile-summary { display: none; }

.sankey__mobile-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0.45rem 0;
}

.sankey__mobile-year {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.78rem;
  color: var(--muted);
  width: 2.8rem;
  flex-shrink: 0;
}

.sankey__mobile-bar {
  flex: 1;
  height: 18px;
  background: var(--fackel-border);
  border-radius: 2px;
  overflow: hidden;
}

.sankey__mobile-fill {
  height: 100%;
  border-radius: 2px;
}

.sankey__mobile-fill--source { background: var(--smoke); }
.sankey__mobile-fill--flow { background: var(--flame); opacity: 0.7; }
.sankey__mobile-fill--leak { background: var(--ember); }

.sankey__mobile-val {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.78rem;
  color: var(--ink);
  width: 1.8rem;
  text-align: right;
  flex-shrink: 0;
}

.sankey__details {
  margin-top: 0.9rem;
  font-size: 0.88rem;
}

.sankey__details summary {
  cursor: pointer;
  color: var(--muted);
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.sankey__table {
  width: 100%;
  margin-top: 0.6rem;
  border-collapse: collapse;
  font-size: 0.88rem;
}

.sankey__table th,
.sankey__table td {
  padding: 0.35em 0.6em;
  border-bottom: 1px solid var(--fackel-border);
  text-align: left;
}

.sankey__table th[scope="col"] {
  background: var(--smoke);
  color: var(--paper);
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.74rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.sankey__table td {
  font-variant-numeric: tabular-nums;
}

.sankey__note {
  margin: 0.75rem 0 0;
  font-size: 0.82rem;
  line-height: 1.55;
  color: var(--muted);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 640px) {
  .sankey__svg-wrap--full { display: none; }
  .sankey__mobile-summary { display: block; }
}

@media (prefers-reduced-motion: reduce) {
  .sankey__btn { transition: none; }
}
</style>
