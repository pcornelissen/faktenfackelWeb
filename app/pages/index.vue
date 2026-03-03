<script setup lang="ts">
import { newsSrc } from '~/news/newsSrc'
import { definePageData } from '~/utils/contentUtils'
import { Icon } from '@iconify/vue'

await definePageData({
  title: 'Faktenfackel – Mythen entlarven, Fakten beleuchten',
  pageHeading: '',
  pageSubHeading: '',
})

// Neueste 4 News-Einträge
const recentNews = [...newsSrc]
  .sort((a, b) => b.date.getTime() - a.date.getTime())
  .slice(0, 4)

function pillarImgName(iconPath: string) {
  return iconPath.replace('/img/categories/', '').replace('.png', '')
}

// Bereiche / Pillars
const pillars = [
  {
    icon: '/img/categories/fake-news.png',
    label: 'Bereich',
    title: 'Faktenchecks',
    desc: 'Geprüfte Behauptungen mit Quellen und klarem Urteil.',
    href: '/faktenchecks',
    cta: 'Alle Faktenchecks',
  },
  {
    icon: '/img/categories/bonfire.png',
    label: 'Bereich',
    title: 'Lagerfeuer',
    desc: 'Blogeinträge, vertiefende Hintergrundartikel und Analysen.',
    href: '/lagerfeuer',
    cta: 'Zum Lagerfeuer',
  },
  {
    icon: '/img/categories/blogging.png',
    label: 'Bereich',
    title: 'Quellen',
    desc: 'Kuratierte Quellensammlung für eigene Recherchen.',
    href: '/quellen',
    cta: 'Quellen entdecken',
  },
  {
    icon: '/img/categories/feedback.png',
    label: 'Bereich',
    title: 'Zitate',
    desc: 'Überprüfte Aussagen von Personen des öffentlichen Lebens.',
    href: '/zitate',
    cta: 'Zitate ansehen',
  },
]
</script>

<template>
  <div class="page-root">
    <!-- HERO -->
    <section class="hero full-bleed">
      <div class="hero-inner">
        <div class="hero-text">
          <div class="hero-tag">
            Demokratie braucht Licht
          </div>
          <h1>Mythen entlarven.<br><span class="hero-highlight">Fakten beleuchten.</span></h1>
          <p class="hero-sub">
            Unabhängige Faktenchecks zu Behauptungen, Mythen und Desinformation
            aus Politik und Gesellschaft – mit belegten Quellen.
          </p>
          <div class="hero-cta">
            <a
              href="/faktenchecks"
              class="btn-primary"
            ><Icon
              icon="mdi:magnify"
              :ssr="true"
              height="16"
            /> Alle Faktenchecks</a>
            <a
              href="/quellen"
              class="btn-secondary"
            ><Icon
              icon="mdi:book-open-variant"
              :ssr="true"
              height="16"
            /> Quellensammlung</a>
          </div>
        </div>

        <!-- NEWS TICKER -->
        <div class="ticker-box">
          <div class="ticker-header">
            <span class="ticker-label"><Icon
              icon="mdi:clock-edit-outline"
              :ssr="true"
              height="14"
            />Letzte Änderungen</span>
            <span class="ticker-dot" />
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
            <a href="/news"><Icon
              icon="mdi:arrow-right"
              :ssr="true"
              height="13"
            /> Vollständiges Änderungslog</a>
          </div>
        </div>
      </div>
    </section>

    <!-- PAGE BODY -->
    <div class="page-body">
      <!-- PILLARS -->
      <div class="pillars">
        <a
          v-for="p in pillars"
          :key="p.href"
          :href="p.href"
          class="pillar"
        >
          <picture>
            <source
              type="image/webp"
              :srcset="`/img/categories/opt/${pillarImgName(p.icon)}-64.webp 64w, /img/categories/opt/${pillarImgName(p.icon)}-128.webp 128w`"
              sizes="52px"
            >
            <img
              :src="p.icon"
              :alt="p.title"
              class="pillar-icon"
            >
          </picture>
          <div class="pillar-title">{{ p.title }}</div>
          <div class="pillar-label">{{ p.label }}</div>
          <p class="pillar-desc">{{ p.desc }}</p>
          <div class="pillar-cta"><Icon
            icon="mdi:arrow-right"
            height="16"
          />{{ p.cta }}</div>
        </a>
      </div>

      <!-- CONTENT GRID -->
      <div class="content-grid">
        <!-- MAIN COLUMN -->
        <div class="main-col">
          <!-- NEUESTE ARTIKEL -->
          <div class="section-header">
            <h2 class="section-title">
              Neueste Faktenchecks
              <span class="badge badge-new">NEU</span>
            </h2>
            <a
              href="/faktenchecks"
              class="section-link"
            >Alle Faktenchecks →</a>
          </div>

          <RecentPosts />

          <div class="section-header section-header--spaced">
            <h2 class="section-title">
              Neueste Lagerfeuer-Artikel
            </h2>
            <a
              href="/lagerfeuer"
              class="section-link"
            >Alle Lagerfeuer-Artikel →</a>
          </div>

          <RecentLagerfeuer />
        </div>

        <!-- SIDEBAR -->
        <aside class="sidebar">
          <!-- KONTAKT BOX -->
          <div class="sidebar-box">
            <div class="sidebar-box-header">
              <span class="sidebar-box-title"><Icon
                icon="mdi:email-outline"
                :ssr="true"
                height="14"
              /> Kontakt & Feedback</span>
            </div>
            <div class="sidebar-box-body">
              <p>
                Die Seite ist im Dezember 2025 gestartet und wird kontinuierlich erweitert.
                Schau gerne regelmäßig vorbei!
              </p>
              <p>
                Feedback und Vorschläge per E-Mail an
                <a href="mailto:kontakt@faktenfackel.de?subject=Feedback%20Faktenfackel-Webseite">kontakt@faktenfackel.de</a>
                oder im <a href="https://discord.faktenfackel.de">Discord</a>.
              </p>
            </div>
          </div>

          <!-- NEUE QUELLEN -->
          <sidebar-recent-sources />

          <!-- NEUE ZITATE -->
          <sidebar-recent-quotes />

          <!-- SUPPORT -->
          <div class="support-box">
            <div class="support-icon">
              <Icon
                icon="mdi:coffee"
                :ssr="true"
                height="28"
              />
            </div>
            <div class="support-title">
              Unterstütze Faktenfackel
            </div>
            <p class="support-desc">
              Die Seite ist werbefrei und unabhängig – mit deiner Hilfe bleibt sie es.
            </p>
            <a
              href="https://buymeacoffee.com/faktenfackel"
              class="btn-primary btn-small"
            >
              <Icon
                icon="mdi:coffee"
                :ssr="true"
                height="14"
              /> Kaffee spendieren
            </a>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-root {
  display: contents;
}

/* ── HERO ── */
.hero {
  background: var(--smoke);
  padding: 4rem 2rem 3rem;
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
  grid-template-columns: 1fr 340px;
  gap: 3rem;
  align-items: center;
}

.hero-tag {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.78rem;
  color: var(--flame);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: 1rem;
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
  font-size: clamp(2.2rem, 4vw, 3.5rem);
  color: var(--paper);
  margin-bottom: 1.2rem;
}

.hero-highlight { color: var(--flame); }

.hero-sub {
  color: #9A8F86;
  font-size: 1rem;
  font-weight: 300;
  line-height: 1.6;
  max-width: 480px;
  margin-bottom: 2rem;
}

.hero-cta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* ── BUTTONS ── */
.btn-primary {
  background: var(--flame);
  color: white;
  padding: 10px 20px;
  border-radius: 3px;
  text-decoration: none;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
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
  color: #C4BAB0;
  padding: 10px 20px;
  border-radius: 3px;
  text-decoration: none;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border: 1px solid #3D3530;
  transition: border-color 0.2s, color 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-secondary:hover { border-color: var(--flame); color: var(--flame); }

.btn-small { font-size: 0.68rem; padding: 8px 16px; }

/* ── TICKER ── */
.ticker-box {
  background: var(--ash);
  border: 1px solid #3D3530;
  border-top: 2px solid var(--flame);
  border-radius: 4px;
  overflow: hidden;
}

.ticker-header {
  background: rgba(232,68,10,0.1);
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #3D3530;
}

.ticker-label {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--flame);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.ticker-dot {
  width: 7px;
  height: 7px;
  background: var(--flame);
  border-radius: 50%;
  animation: pulse 1.5s infinite;
  display: block;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

.ticker-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.ticker-item {
  padding: 5px 16px;
  border-bottom: 1px solid #2D2822;
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.ticker-item:last-child { border-bottom: none; }

.ticker-date {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  color: #9A8F86;
  white-space: nowrap;
  margin-top: 2px;
  min-width: 62px;
}

.ticker-text {
  font-size: 0.9rem;
  color: #C4BAB0;
  line-height: 1.4;
}

.ticker-footer {
  padding: 10px 16px;
  background: rgba(0,0,0,0.15);
}

.ticker-footer a {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  color: var(--flame);
  text-decoration: none;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.ticker-footer a:hover {
  filter: brightness(1.2);
}

/* ── PAGE BODY ── */
.page-body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
}

/* ── PILLARS ── */
.pillars {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  border: 1px solid var(--fackel-border);
  border-radius: 6px;
  overflow: hidden;
  margin: 2.5rem 0;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.pillar {
  padding: 1.8rem 1.4rem;
  border-right: 1px solid var(--fackel-border);
  text-decoration: none;
  color: inherit;
  position: relative;
  transition: background 0.2s;
  background: white;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pillar:last-child { border-right: none; }
.pillar:hover { background: #FDFAF5; }

.pillar::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--flame);
  transform: scaleX(0);
  transition: transform 0.25s;
  transform-origin: left;
}

.pillar:hover::before { transform: scaleX(1); }

.pillar picture { display: block; align-self: center; margin-bottom: 0.3rem; line-height: 0; }
.pillar-icon { width: 52px; height: 52px; object-fit: contain; }

.pillar-label {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--flame);
  font-weight: 600;
  margin-top: -0.3rem;
}

.pillar-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.2;
  margin: 0;
}

.pillar-desc {
  font-size: 0.88rem;
  color: var(--muted);
  line-height: 1.5;
  font-weight: 300;
  margin: 0;
}

.pillar-cta {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  color: var(--muted);
  margin-top: auto;
  padding-top: 0.8rem;
  border-top: 1px solid var(--fackel-border);
  display: flex;
  align-items: center;
  gap: 6px;
}

.pillar-cta :deep(svg) {
  color: var(--flame);
  flex-shrink: 0;
}

/* ── CONTENT GRID ── */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 3rem;
}

/* ── SECTION HEADER ── */
.section-header--spaced {
  margin-top: 2.5rem;
}

.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 0.8rem;
  border-bottom: 2px solid var(--ink);
}

.section-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--ink);
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.badge {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 3px 8px;
  border-radius: 2px;
  font-weight: 600;
}

.badge-new { background: var(--flame); color: white; }

.section-link {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.78rem;
  color: var(--flame);
  text-decoration: none;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
}

.section-link:hover { text-decoration: underline; }

/* ── SIDEBAR ── */
.sidebar { display: flex; flex-direction: column; gap: 1.5rem; }

.sidebar-box {
  background: white;
  border: 1px solid var(--fackel-border);
  border-radius: 6px;
  overflow: hidden;
}

.sidebar-box-header {
  padding: 10px 16px;
  background: var(--smoke);
  border-bottom: 1px solid #2D2822;
}

.sidebar-box-title {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--flame);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.sidebar-box-body {
  padding: 1rem;
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--ink);
}

.sidebar-box-body p { margin-bottom: 0.8em; }
.sidebar-box-body p:last-child { margin-bottom: 0; }

.sidebar-box-body a {
  color: var(--flame);
  text-decoration: underline;
}

/* ── SUPPORT BOX ── */
.support-box {
  background: linear-gradient(135deg, var(--smoke), var(--ash));
  border: 1px solid #3D3530;
  border-radius: 6px;
  padding: 1.5rem;
  text-align: center;
}

.support-icon { display: flex; justify-content: center; margin-bottom: 0.6rem; color: var(--flame); }

.support-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1rem;
  color: var(--paper);
  margin-bottom: 0.4rem;
  font-weight: 700;
}

.support-desc {
  font-size: 0.88rem;
  color: #9A8F86;
  margin-bottom: 1rem;
  line-height: 1.5;
}

/* ── RESPONSIVE ── */
@media screen and (max-width: 1000px) {
  .pillars { grid-template-columns: repeat(2, 1fr); }
  .pillar { border-bottom: 1px solid var(--fackel-border); }
  .pillar:nth-child(2) { border-right: none; }
  .pillar:nth-child(3), .pillar:nth-child(4) { border-bottom: none; }
  .pillar:nth-child(3) { border-right: 1px solid var(--fackel-border); }
}

@media screen and (max-width: 900px) {
  .hero-inner {
    grid-template-columns: 1fr;
  }
  .content-grid {
    grid-template-columns: 1fr;
  }
  .hero {
    padding: 2.5rem 1rem 2rem;
  }
  .page-body {
    padding: 0 1rem 3rem;
  }
}

@media screen and (max-width: 560px) {
  .pillars { grid-template-columns: 1fr; }
  .pillar { border-right: none; border-bottom: 1px solid var(--fackel-border); }
  .pillar:last-child { border-bottom: none; }
  .hero-cta { flex-direction: column; }
  .btn-primary, .btn-secondary { justify-content: center; text-align: center; }
}
</style>
