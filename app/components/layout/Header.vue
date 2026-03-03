<script setup lang="ts">
import Menu from '~/components/layout/Menu.vue'
import SearchBar from '~/components/layout/SearchBar.vue'

const menuOpen = ref(false)
const route = useRoute()

watch(() => route.path, () => {
  menuOpen.value = false
})

const menuItems = [
  { name: 'Start', href: '/' },
  { name: 'Faktenchecks', href: '/faktenchecks' },
  { name: 'Lagerfeuer', href: '/lagerfeuer' },
  { name: 'Glossar', href: '/glossar' },
  { name: 'Quellen', href: '/quellen' },
  { name: 'Zitate', href: '/zitate' },
  { name: 'Änderungen', href: '/news' },
]

function isActive(href: string) {
  const path = route.path === '' ? '/' : route.path
  return (href !== '/' && path.startsWith(href)) || (path === '/' && href === '/')
}
</script>

<template>
  <div class="sticky top-0 z-50 nav-wrapper shadow-md">
    <header class="nav-inner">
      <NuxtLink
        to="/"
        class="nav-logo"
      >
        <NuxtImg
          src="/img/logo-sm.webp"
          format="webp"
          alt="FaktenFackel Logo"
          height="44"
          width="44"
          class="logo-img"
        />
        <span class="logo-text">Fakten<em>fackel</em></span>
      </NuxtLink>

      <Menu />

      <div class="nav-right">
        <div class="search-wrap">
          <SearchBar />
        </div>
        <button
          class="hamburger"
          :class="{ 'is-open': menuOpen }"
          :aria-expanded="menuOpen"
          aria-label="Menü öffnen"
          @click="menuOpen = !menuOpen"
        >
          <span class="bar" />
          <span class="bar" />
          <span class="bar" />
        </button>
      </div>
    </header>
    <div class="nav-accent-line" />

    <nav
      v-if="menuOpen"
      class="mobile-menu"
    >
      <a
        v-for="item in menuItems"
        :key="item.name"
        :href="item.href"
        class="mobile-item"
        :class="{ 'mobile-item-active': isActive(item.href) }"
        @click="menuOpen = false"
      >
        {{ item.name }}
      </a>
    </nav>
  </div>
</template>

<style scoped>
.nav-wrapper {
  background: var(--smoke);
}

.nav-accent-line {
  height: 2px;
  background: var(--flame);
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  height: 60px;
  gap: 1rem;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}

.logo-img {
  border-radius: 4px;
}

.logo-text {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--paper);
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.logo-text em {
  color: var(--flame);
  font-style: normal;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.search-wrap {
  display: flex;
  align-items: center;
}

/* ── Hamburger button ── */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 36px;
  height: 36px;
  background: none;
  border: 1px solid #3D3530;
  border-radius: 4px;
  cursor: pointer;
  padding: 7px;
  flex-shrink: 0;
}

.bar {
  display: block;
  width: 100%;
  height: 2px;
  background: #C4BAB0;
  border-radius: 2px;
  transition: transform 0.2s, opacity 0.2s, background 0.2s;
  transform-origin: center;
}

.hamburger:hover .bar {
  background: var(--flame);
}

/* X animation when open */
.is-open .bar:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.is-open .bar:nth-child(2) { opacity: 0; }
.is-open .bar:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* ── Mobile menu ── */
.mobile-menu {
  background: var(--ash);
  border-top: 1px solid #2D2822;
  display: flex;
  flex-direction: column;
}

.mobile-item {
  display: block;
  padding: 0.9rem 1.5rem;
  color: #C4BAB0;
  text-decoration: none;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.85rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border-bottom: 1px solid #2D2822;
  transition: color 0.15s, background 0.15s;
}

.mobile-item:last-child {
  border-bottom: none;
}

.mobile-item:hover {
  color: var(--flame);
  background: rgba(232, 68, 10, 0.07);
}

.mobile-item-active {
  color: var(--flame) !important;
  background: rgba(232, 68, 10, 0.1);
}

/* ── Responsive ── */
@media screen and (max-width: 900px) {
  .nav-inner {
    padding: 0 1rem;
  }
  .logo-text {
    font-size: 1.1rem;
  }
}

@media screen and (max-width: 850px) {
  .hamburger {
    display: flex;
  }
}

@media screen and (max-width: 500px) {
  .logo-text {
    display: none;
  }
}
</style>
