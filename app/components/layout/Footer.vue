<script setup lang="ts">
import { Icon } from '@iconify/vue'

const date = ref<Date>()

onMounted(() => {
  date.value = new Date()
  useHead({
    link: [{
      href: '/feed.xml',
      rel: 'alternate',
      type: 'application/rss+xml',
    }],
  })
})
</script>

<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="footer-logo">
          Fakten<em>fackel</em>
        </div>
        <p class="footer-tagline">
          Unabhängige Faktencheck-Plattform für Deutschland. Seit Dezember 2025 aktiv – kontinuierlich erweitert.
        </p>
        <a
          href="https://buymeacoffee.com/faktenfackel"
          class="support-link"
        >
          <Icon
            icon="mdi:coffee"
            :ssr="true"
            height="14"
          />
          Unterstütze uns
        </a>
      </div>

      <div class="footer-col">
        <div class="footer-col-title">
          <Icon
            icon="mdi:newspaper-variant-outline"
            :ssr="true"
            height="13"
          />Inhalte
        </div>
        <ul>
          <li><a href="/faktenchecks">Faktenchecks</a></li>
          <li><a href="/lagerfeuer">Lagerfeuer</a></li>
          <li><a href="/quellen">Quellen</a></li>
          <li><a href="/zitate">Zitate</a></li>
          <li><a href="/glossar">Glossar</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <div class="footer-col-title">
          <Icon
            icon="mdi:information-outline"
            :ssr="true"
            height="13"
          />Über uns
        </div>
        <ul>
          <li><NuxtLink to="/about">Über Faktenfackel</NuxtLink></li>
          <li><NuxtLink to="/faq">FAQ</NuxtLink></li>
          <li><a href="/news">Änderungslog</a></li>
          <li><NuxtLink to="/mehr">Social Media</NuxtLink></li>
          <li><a href="https://mein.online-impressum.de/faktenfackel/">Social Hub</a></li>
          <li><a href="/feed.xml">RSS Feed</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <div class="footer-col-title">
          <Icon
            icon="mdi:scale-balance"
            :ssr="true"
            height="13"
          />Rechtliches
        </div>
        <ul>
          <li><a href="/impressum">Impressum</a></li>
          <li><NuxtLink to="/datenschutz">Datenschutz</NuxtLink></li>
          <li><a href="mailto:kontakt@faktenfackel.de">kontakt@faktenfackel.de</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <span>©{{ date?.getFullYear() || '2026' }} Faktenfackel · Alle Angaben ohne Gewähr, Logos und Markennamen gehören den jeweiligen Markeninhabern</span>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: var(--smoke);
  border-top: 1px solid #2D2822;
  margin-top: 4rem;
  padding: 3rem 2rem 1.5rem;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr 1fr;
  gap: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #2D2822;
}

.footer-logo {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--paper);
  margin-bottom: 0.6rem;
}

.footer-logo em {
  color: var(--flame);
  font-style: normal;
}

.footer-tagline {
  font-size: 0.9rem;
  color: #9A8F86;
  line-height: 1.6;
  font-weight: 300;
  margin-bottom: 1rem;
}

.support-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--flame);
  text-decoration: none;
}

.support-link:hover {
  color: var(--ember);
}

.footer-col-title {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--flame);
  margin-bottom: 1rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.footer-col ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
}

.footer-col a {
  font-size: 0.92rem;
  color: #9A8F86;
  text-decoration: none;
  transition: color 0.15s;
}

.footer-col a:hover {
  color: var(--paper);
}

.footer-bottom {
  max-width: 1200px;
  margin: 1.5rem auto 0;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  color: #9A8F86;
  letter-spacing: 0.05em;
}

@media screen and (max-width: 900px) {
  .footer-inner {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
  .footer-brand {
    grid-column: 1 / -1;
  }
}

@media screen and (max-width: 560px) {
  .footer-inner {
    grid-template-columns: 1fr;
  }
  .footer-brand {
    grid-column: 1;
  }
  .site-footer {
    padding: 2rem 1rem 1rem;
  }
}
</style>
