<script setup lang="ts">
import { newsSrc } from '~/news/newsSrc'

const recentNews = [...newsSrc]
  .sort((a, b) => b.date.getTime() - a.date.getTime())
  .slice(0, 4)

const [
  { data: faktenchecksCount },
  { data: lagerfeuerCount },
  { data: quellenlinksCount },
  { data: quellenCount },
] = await Promise.all([
  useAsyncData('stat-faktenchecks', () =>
    queryCollection('faktenchecks').where('path', 'NOT LIKE', '%_info%').count()),
  useAsyncData('stat-lagerfeuer', () =>
    queryCollection('lagerfeuer').where('path', 'NOT LIKE', '%_info%').count()),
  useAsyncData('stat-quellenlinks', () =>
    queryCollection('quellenlinks').count()),
  useAsyncData('stat-quellen', () =>
    queryCollection('quellen').count()),
])

const totalCount = computed(
  () => (faktenchecksCount.value ?? 0)
    + (lagerfeuerCount.value ?? 0)
    + (quellenlinksCount.value ?? 0)
    + (quellenCount.value ?? 0),
)
</script>

<template>
  <section class="hero full-bleed">
    <div class="hero-inner">
      <div class="hero-text">
        <div class="hero-tag">
          Demokratie braucht Licht
        </div>
        <h1>Mythen entlarven.<br><span class="hero-highlight">Fakten ruhig und klar beleuchten.</span></h1>
        <p class="hero-sub">
          Faktenfackel prüft Behauptungen aus Politik und Gesellschaft,
          trennt Belegbares von Stimmungsmache und zeigt offen, worauf jedes Urteil beruht.
        </p>
        <div class="hero-cta">
          <a
            href="/faktenchecks"
            class="btn-primary"
          ><UIcon
            name="mdi:magnify"
            class="size-4"
          /> Neueste Faktenchecks</a>
          <a
            href="/about"
            class="btn-secondary"
          ><UIcon
            name="mdi:book-open-page-variant-outline"
            class="size-4"
          /> Wie wir arbeiten</a>
        </div>

        <div
          class="hero-stats"
          aria-label="Inhaltsübersicht"
        >
          <div
            class="hero-stat-total"
            tabindex="0"
            aria-describedby="stat-tooltip"
          >
            <strong class="hero-stat-num">{{ totalCount }}</strong>
            <span class="hero-stat-label">Faktenchecks, Quellen und redaktionelle Inhalte</span>
            <div
              id="stat-tooltip"
              class="stat-tooltip"
              role="tooltip"
            >
              <div class="stat-tooltip-row">
                <span class="stat-tooltip-num">{{ faktenchecksCount }}</span>
                <span>Faktenchecks</span>
              </div>
              <div class="stat-tooltip-row">
                <span class="stat-tooltip-num">{{ lagerfeuerCount }}</span>
                <span>Lagerfeuer-Artikel</span>
              </div>
              <div class="stat-tooltip-row">
                <span class="stat-tooltip-num">{{ quellenlinksCount }}</span>
                <span>Quellenlinks</span>
              </div>
              <div class="stat-tooltip-row">
                <span class="stat-tooltip-num">{{ quellenCount }}</span>
                <span>Quellen</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- NEWS TICKER -->
      <div class="ticker-box">
        <div class="ticker-header">
          <span class="ticker-label"><UIcon
            name="mdi:clock-edit-outline"
            class="size-3.5"
          />Aktuelles Signal</span>
        </div>
        <div class="ticker-intro">
          Neue Recherchen, neue Quellen, neue Einordnungen.
        </div>
        <ul class="ticker-list">
          <li
            v-for="item in recentNews"
            :key="item.date.toString()"
            class="ticker-item"
          >
            <span class="ticker-date">{{ dateString(item.date) }}</span>
            <span class="ticker-text">{{ item.title }}</span>
          </li>
        </ul>
        <div class="ticker-footer">
          <a href="/news/"><UIcon
            name="mdi:arrow-right"
            class="size-3.5"
          /> Vollständiges Änderungslog</a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  background: var(--smoke);
  padding: 3rem 2rem 3.75rem;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 70% 50%, rgba(232,68,10,0.14) 0%, transparent 60%),
    radial-gradient(ellipse at 15% 80%, rgba(212,160,23,0.07) 0%, transparent 50%);
  pointer-events: none;
}

.hero-inner {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) 360px;
  gap: 3rem;
  align-items: end;
}

.hero-tag {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.82rem;
  color: var(--flame);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: 1.1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.hero-tag::before {
  content: '';
  width: 24px;
  height: 1px;
  background: var(--flame);
  display: block;
}

.hero h1 {
  font-size: clamp(2.75rem, 6vw, 4.8rem);
  color: var(--paper);
  margin-bottom: 1.35rem;
  line-height: 0.94;
  letter-spacing: -0.04em;
  max-width: 10ch;
}

.hero-highlight { color: var(--flame); }

.hero-sub {
  color: #9A8F86;
  font-size: clamp(1.15rem, 2vw, 1.4rem);
  font-weight: 400;
  line-height: 1.48;
  max-width: 34rem;
  margin-bottom: 2.1rem;
}

.hero-cta {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

/* ── BUTTONS ── */
.btn-primary {
  background: var(--flame);
  color: white;
  padding: 0.95rem 1.3rem;
  border-radius: 999px;
  text-decoration: none;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 600;
  transition: background 0.2s, transform 0.1s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-primary:hover { background: var(--flame); filter: brightness(0.88); transform: translateY(-1px); }

.btn-secondary {
  background: transparent;
  color: var(--paper);
  padding: 0.95rem 1.3rem;
  border-radius: 999px;
  text-decoration: none;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid #4B4038;
  transition: border-color 0.2s, color 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-secondary:hover { border-color: var(--flame); color: var(--flame); }

/* ── STATS ── */
.hero-stats {
  margin-top: 1.75rem;
  padding-top: 1.2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.hero-stat-total {
  position: relative;
  display: inline-flex;
  align-items: baseline;
  gap: 0.42em;
  cursor: default;
}

/* bridge: fills the gap so the tooltip stays open when moving the mouse up */
.hero-stat-total::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  height: 8px;
}

.hero-stat-num {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--paper);
  letter-spacing: -0.01em;
}

.hero-stat-label {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.78rem;
  color: #9A8F86;
  letter-spacing: 0.05em;
  text-decoration: underline;
  text-decoration-style: dashed;
  text-underline-offset: 3px;
  text-decoration-color: #3D3530;
}

.stat-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  background: var(--ash);
  border: 1px solid #3D3530;
  border-radius: 4px;
  padding: 0.55rem 0.75rem;
  min-width: 175px;
  opacity: 0;
  pointer-events: none;
  transform: translateY(3px);
  transition: opacity 0.15s, transform 0.15s;
  white-space: nowrap;
  z-index: 10;
}

/* downward arrow */
.stat-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 14px;
  border: 5px solid transparent;
  border-top-color: #3D3530;
}

.hero-stat-total:hover .stat-tooltip,
.hero-stat-total:focus-within .stat-tooltip {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.stat-tooltip-row {
  display: flex;
  justify-content: space-between;
  gap: 1.2rem;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.76rem;
  color: #C4BAB0;
  padding: 2px 0;
}

.stat-tooltip-num {
  color: var(--paper);
  font-weight: 700;
  min-width: 2ch;
  text-align: right;
}

/* ── TICKER ── */
.ticker-box {
  background: rgba(255,255,255,0.045);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 18px;
  padding: 1.35rem 1.35rem 1rem;
  backdrop-filter: blur(8px);
}

.ticker-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 0.7rem;
}

.ticker-label {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.73rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--flame);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.ticker-intro {
  color: var(--paper);
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.85rem;
  line-height: 1.05;
  margin-bottom: 0.9rem;
}

.ticker-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.ticker-item {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 0.7rem;
  padding: 0.75rem 0;
  border-top: 1px solid rgba(255,255,255,0.07);
  align-items: start;
}

.ticker-item:first-child {
  border-top: none;
  padding-top: 0.2rem;
}

.ticker-date {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  color: var(--flame);
}

.ticker-text {
  font-size: 0.94rem;
  color: #D2C5B7;
  line-height: 1.45;
}

.ticker-footer {
  margin-top: 0.9rem;
  padding-top: 0.85rem;
  border-top: 1px solid rgba(255,255,255,0.07);
}

.ticker-footer a {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.74rem;
  color: var(--flame);
  text-decoration: none;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.ticker-footer a:hover {
  filter: brightness(1.2);
}

@media screen and (max-width: 900px) {
  .hero-inner {
    grid-template-columns: 1fr;
  }
  .ticker-box {
    max-width: 36rem;
  }
  .hero {
    padding: 2.35rem 1rem 2.6rem;
  }
}

@media screen and (max-width: 560px) {
  .hero h1 {
    max-width: 9.5ch;
  }
  .ticker-intro {
    font-size: 1.6rem;
  }
  .hero-cta { flex-direction: column; }
  .btn-primary, .btn-secondary { justify-content: center; text-align: center; }
}
</style>
