<script setup lang="ts">
const date = ref<Date>()

useHead({
  link: [{
    href: '/feed.xml',
    rel: 'alternate',
    type: 'application/rss+xml',
  }],
})

onMounted(() => {
  date.value = new Date()
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
          <UIcon
            name="mdi:coffee"
            class="size-3.5"
          />
          Unterstütze uns
        </a>
      </div>

      <div class="footer-col">
        <div class="footer-col-title">
          <UIcon
            name="mdi:newspaper-variant-outline"
            class="size-3.5"
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
          <UIcon
            name="mdi:information-outline"
            class="size-3.5"
          />Über uns
        </div>
        <ul>
          <li><NuxtLink to="/about/">Über Faktenfackel</NuxtLink></li>
          <li><NuxtLink to="/faq/">FAQ</NuxtLink></li>
          <li><a href="/news/">Änderungslog</a></li>
          <li><NuxtLink to="/mehr/">Social Media</NuxtLink></li>
          <li><a href="https://mein.online-impressum.de/faktenfackel/">Social Hub</a></li>
          <li><a href="/feed.xml">RSS Feed</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <div class="footer-col-title">
          <UIcon
            name="mdi:scale-balance"
            class="size-3.5"
          />Rechtliches
        </div>
        <ul>
          <li><a href="/impressum/">Impressum</a></li>
          <li><NuxtLink to="/datenschutz/">Datenschutz</NuxtLink></li>
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
  margin-top: 5rem;
  padding: 3.5rem 2rem 1.6rem;
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
  font-size: 1.45rem;
  font-weight: 700;
  color: var(--paper);
  margin-bottom: 0.6rem;
}

.footer-logo em {
  color: var(--flame);
  font-style: normal;
}

.footer-tagline {
  font-size: 1rem;
  color: #9A8F86;
  line-height: 1.6;
  font-weight: 400;
  margin-bottom: 1rem;
  max-width: 30ch;
  text-wrap: pretty;
}

.support-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--flame);
  text-decoration: none;
  min-height: 2.25rem;
}

.support-link:hover {
  color: var(--ember);
}

.footer-col-title {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.76rem;
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
  margin: 0;
}

.footer-col a {
  font-size: 1rem;
  color: #9A8F86;
  text-decoration: none;
  transition: color 0.15s;
  display: inline-block;
  padding: 0.12rem 0;
}

.footer-col a:hover {
  color: var(--paper);
}

.footer-bottom {
  max-width: 1200px;
  margin: 1.5rem auto 0;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.78rem;
  color: #9A8F86;
  letter-spacing: 0.05em;
  line-height: 1.6;
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
  .site-footer {
    margin-top: 3.4rem;
    padding: 1.8rem 1rem 1rem;
  }

  .footer-inner {
    grid-template-columns: 1fr;
    gap: 1.4rem;
    padding-bottom: 1.4rem;
  }

  .footer-brand {
    grid-column: 1;
  }

  .footer-logo {
    font-size: 1.28rem;
    margin-bottom: 0.45rem;
  }

  .footer-tagline {
    font-size: 0.94rem;
    line-height: 1.55;
    margin-bottom: 0.85rem;
    max-width: none;
  }

  .support-link {
    font-size: 0.76rem;
    letter-spacing: 0.07em;
  }

  .footer-col {
    padding-top: 1rem;
    border-top: 1px solid rgba(154, 143, 134, 0.14);
  }

  .footer-col-title {
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    margin-bottom: 0.8rem;
  }

  .footer-col ul {
    gap: 0.45rem;
  }

  .footer-col a {
    font-size: 0.96rem;
    padding: 0.05rem 0;
  }

  .footer-bottom {
    margin-top: 1.1rem;
    font-size: 0.72rem;
    letter-spacing: 0.03em;
  }
}
</style>
