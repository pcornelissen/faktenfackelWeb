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
        <!-- MAIN COLUMN -->
        <div class="main-col">
          <div class="section-header">
            <h2 class="section-title">
              Neueste Faktenchecks
              <span class="badge badge-new">NEU</span>
            </h2>
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
            <h2 class="section-title">
              Neueste Lagerfeuer-Artikel
            </h2>
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

        <!-- SIDEBAR -->
        <aside class="sidebar">
          <!-- KONTAKT BOX -->
          <div class="sidebar-box">
            <div class="sidebar-box-header">
              <span class="sidebar-box-title"><UIcon
                name="mdi:email-outline"
                class="size-3.5"
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

          <RecentSources />
          <RecentQuotes />

          <!-- SUPPORT -->
          <div class="support-box">
            <div class="support-icon">
              <UIcon
                name="mdi:coffee"
                class="size-7"
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
  padding: 0 2rem 4rem;
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
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.section-link-icon { flex-shrink: 0; }

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
@media screen and (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  .page-body {
    padding: 0 1rem 3rem;
  }
}
</style>
