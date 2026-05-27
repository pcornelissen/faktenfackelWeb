<script setup lang="ts">
import { onMounted, ref } from 'vue'

defineProps<{
  caption: string
  alt: string
}>()

const srcEl = ref<HTMLElement | null>(null)
const renderEl = ref<HTMLElement | null>(null)
const rendered = ref(false)

// Faktenfackel-CI auf Mermaids base-Theme gemappt.
// Konkrete Hex-Werte (aus main.css), da das generierte SVG keine CSS-Variablen liest.
const themeVariables = {
  background: '#F5F0E8', // --paper
  primaryColor: '#F5F0E8', // Node-Fill (paper)
  primaryBorderColor: '#62584F', // --muted (dezenter Rahmen; Ember nur als Akzent)
  primaryTextColor: '#1C1917', // --ink
  secondaryColor: '#F0EAE0',
  tertiaryColor: '#FAF6F1',
  lineColor: '#62584F', // --muted
  textColor: '#1C1917', // --ink
  fontFamily: 'Ubuntu Mono, monospace',
  fontSize: '15px',
}

// Liest den rohen Mermaid-Quelltext aus dem gerenderten Slot.
// shiki rendert jede Zeile als <span class="line"> (display:block) OHNE
// Newline-Textknoten — daher die Zeilen einzeln einsammeln und mit \n joinen.
function extractSource(): string {
  const root = srcEl.value
  if (!root) return ''
  const lines = root.querySelectorAll('.line')
  if (lines.length) {
    return Array.from(lines)
      .map(l => l.textContent ?? '')
      .join('\n')
      .replace(/\n+$/, '')
      .trim()
  }
  const code = root.querySelector('code') ?? root.querySelector('pre') ?? root
  return (code.textContent ?? '').trim()
}

onMounted(async () => {
  const source = extractSource()
  if (!source) return
  try {
    // Webfont (Ubuntu Mono) erst laden lassen: Mermaid misst die Label-Breite
    // beim Rendern. Ohne geladenen Font misst es mit Fallback-Metrik → die
    // breiteren Ubuntu-Mono-Glyphen werden später im Knoten abgeschnitten.
    if (document.fonts?.ready) {
      try {
        await document.fonts.ready
      } catch {
        // Font-API nicht verfügbar/abgebrochen — Rendering trotzdem versuchen.
      }
    }
    const mermaid = (await import('mermaid')).default
    // initialize() pro Mount mit identischer Config — günstig und unkritisch.
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables,
      securityLevel: 'strict', // mermaid sanitisiert den SVG-Output
      // SVG-<text>-Labels statt HTML-foreignObject anfordern (valides XML,
      // exakte getBBox-Breite). Mermaid v11 emittiert je nach Renderer
      // trotzdem foreignObject — deshalb unten zusätzlich der tolerante
      // HTML-Parser als Absicherung.
      htmlLabels: false,
      flowchart: { htmlLabels: false },
    })
    const id = `ffdiagram-${Math.random().toString(36).slice(2)}`
    const { svg } = await mermaid.render(id, source)
    if (renderEl.value) {
      // Toleranter HTML-Parser statt image/svg+xml: Mermaid-SVG enthält oft
      // foreignObject-HTML, das nicht wohlgeformtes XML ist (z.B. <br>) und
      // den XML-Parser mit parsererror abbrechen ließe. text/html parst das
      // robust; den <svg>-Knoten dann sicher importieren (kein innerHTML).
      const parsed = new DOMParser().parseFromString(svg, 'text/html')
      const svgEl = parsed.body.querySelector('svg')
      if (!svgEl) {
        console.error('[Diagram] Kein SVG im Mermaid-Output')
        return
      }
      renderEl.value.replaceChildren(document.importNode(svgEl, true))
      rendered.value = true
    }
  } catch (e) {
    // Diagramm ist immer ergänzend: bei Fehler bleibt die Caption stehen.
    console.error('[Diagram] Mermaid-Render fehlgeschlagen:', e)
  }
})
</script>

<template>
  <figure
    class="ff-diagram"
    role="img"
    :aria-label="alt"
  >
    <!-- Roh-Quelltext (immer visuell verborgen); nur Quelle für extractSource() -->
    <div
      ref="srcEl"
      class="ff-diagram-src"
      aria-hidden="true"
    >
      <slot />
    </div>
    <div
      v-show="rendered"
      ref="renderEl"
      class="ff-diagram-render"
    />
    <figcaption class="ff-diagram-caption">
      {{ caption }}
    </figcaption>
  </figure>
</template>

<style scoped>
.ff-diagram {
  margin: 1.5rem 0;
}

.ff-diagram-src {
  display: none;
}

.ff-diagram-render {
  display: flex;
  justify-content: center;
  padding: 1rem;
  background: var(--paper);
  border: 1px solid var(--fackel-border);
  border-radius: 4px;
  overflow-x: auto;
}

.ff-diagram-render :deep(svg) {
  max-width: 100%;
  height: auto;
}

/* Geometrie ans CI angleichen: dezente 4px-Ecken (wie Cards/Buttons).
   Strichstärke + Farben kommen aus Mermaids themeVariables (--muted Rahmen). */
.ff-diagram-render :deep(.node rect),
.ff-diagram-render :deep(.node polygon),
.ff-diagram-render :deep(.cluster rect) {
  rx: 4px;
  ry: 4px;
}

.ff-diagram-caption {
  margin-top: 0.5rem;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.8rem;
  color: var(--muted);
  text-align: center;
  line-height: 1.4;
}
</style>
