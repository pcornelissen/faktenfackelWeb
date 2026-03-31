<script setup lang="ts">
import { definePageData } from '~/utils/contentUtils'

await definePageData({
  title: 'Faktenfackel – Mythen entlarven, Fakten beleuchten',
  pageHeading: '',
  pageSubHeading: '',
  description: 'Faktenfackel prüft Behauptungen, entlarvt Mythen und beleuchtet politische Desinformation – mit Quellen, Fakten und klarem Urteil. Unabhängig, kostenlos, für alle.',
})
</script>

<template>
  <div class="page-root">
    <HeroSection />

    <div class="page-body">
      <HomePillars />

      <!-- CONTENT GRID -->
      <div class="content-grid">
        <div class="main-col">
          <div class="section-header">
            <div class="section-copy">
              <div class="section-kicker">
                Kernbereich
              </div>
              <h2 class="section-title">
                Aktuelle Faktenchecks
              </h2>
            </div>
            <a
              href="/faktenchecks"
              class="section-link"
            >Alle Faktenchecks <UIcon
              name="mdi:arrow-right"
              class="section-link-icon"
            /></a>
          </div>

          <RecentPosts />

          <div class="section-header section-header--spaced">
            <div class="section-copy">
              <div class="section-kicker">
                Einordnung
              </div>
              <h2 class="section-title">
                Neue Lagerfeuer-Artikel
              </h2>
            </div>
            <a
              href="/lagerfeuer"
              class="section-link"
            >Alle Lagerfeuer-Artikel <UIcon
              name="mdi:arrow-right"
              class="section-link-icon"
            /></a>
          </div>

          <RecentLagerfeuer />
        </div>

        <aside class="sidebar">
          <div class="sidebar-note">
            <div class="sidebar-note-label">
              Vertrauensebene
            </div>
            <h3 class="sidebar-note-title">
              So arbeitet Faktenfackel
            </h3>
            <p class="sidebar-note-text">
              Die Quellenbasis bleibt sichtbar, aber die Startseite gibt ihr bewusst eine ruhigere Rolle als dem eigentlichen Faktencheck-Einstieg.
            </p>
            <div class="sidebar-links">
              <a href="/about">Über die Arbeitsweise</a>
              <a href="mailto:kontakt@faktenfackel.de?subject=Feedback%20Faktenfackel-Webseite">Kontakt</a>
            </div>
          </div>

          <RecentSources />
          <RecentQuotes />

          <div class="support-box">
            <div class="support-label">
              Unterstützung
            </div>
            <div class="support-title">
              Unterstütze Faktenfackel
            </div>
            <p class="support-desc">
              Werbefrei, unabhängig und offen nachvollziehbar. Wenn dir diese Richtung wichtig ist, kannst du sie direkt unterstützen.
            </p>
            <a
              href="https://buymeacoffee.com/faktenfackel"
              class="btn-primary btn-small"
            >
              <UIcon
                name="mdi:coffee"
                class="size-3.5"
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

.btn-small { font-size: 0.68rem; padding: 8px 16px; }

/* ── PAGE BODY ── */
.page-body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 4.5rem;
}

/* ── CONTENT GRID ── */
.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 1.75rem;
}

/* ── SECTION HEADER ── */
.section-header--spaced {
  margin-top: 3rem;
}

.section-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.4rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--fackel-border);
}

.section-copy {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.section-kicker {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.76rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--flame);
  font-weight: 600;
}

.section-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  color: var(--ink);
  margin: 0;
  line-height: 0.98;
}

.section-link {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.8rem;
  color: var(--ember);
  text-decoration: none;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.section-link-icon { flex-shrink: 0; }

.section-link:hover { text-decoration: underline; }

/* ── SIDEBAR ── */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sidebar-note {
  background: linear-gradient(180deg, white, #FBF6EF);
  border: 1px solid var(--fackel-border);
  border-radius: 1.1rem;
  padding: 1.3rem;
  box-shadow: 0 10px 24px rgba(31, 22, 15, 0.04);
}

.sidebar-note-label {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.74rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--flame);
  font-weight: 600;
  margin-bottom: 0.7rem;
}

.sidebar-note-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.6rem;
  line-height: 1.04;
  margin: 0 0 0.7rem;
}

.sidebar-note-text {
  margin: 0;
  font-size: 1rem;
  line-height: 1.55;
  color: var(--muted);
}

.sidebar-links {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-links a {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.78rem;
  color: var(--ember);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
}

/* ── SUPPORT BOX ── */
.support-box {
  background: linear-gradient(180deg, #FFF, #FAF2E7);
  border: 1px solid var(--fackel-border);
  border-radius: 1.1rem;
  padding: 1.3rem;
  box-shadow: 0 10px 24px rgba(31, 22, 15, 0.04);
}

.support-label {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.74rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--flame);
  font-weight: 600;
  margin-bottom: 0.7rem;
}

.support-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.6rem;
  color: var(--ink);
  margin-bottom: 0.55rem;
  font-weight: 700;
  line-height: 1.05;
}

.support-desc {
  font-size: 1rem;
  color: var(--muted);
  margin-bottom: 1rem;
  line-height: 1.55;
}

.btn-primary {
  background: var(--flame);
  color: white;
  padding: 0.85rem 1.1rem;
  border-radius: 999px;
  text-decoration: none;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 600;
  transition: background 0.2s, transform 0.1s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-primary:hover { background: var(--flame); filter: brightness(0.9); transform: translateY(-1px); }

.btn-small {
  width: fit-content;
}

/* ── RESPONSIVE ── */
@media screen and (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  .page-body {
    padding: 0 1rem 3rem;
  }
  .section-header {
    align-items: start;
    flex-direction: column;
  }
}

@media screen and (max-width: 560px) {
  .section-title {
    font-size: 1.8rem;
  }
}
</style>
