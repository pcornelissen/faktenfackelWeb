<script setup lang="ts">
import Menu from '~/components/layout/Menu.vue'
import SearchBar from '~/components/layout/SearchBar.vue'
import { navItems } from '~/utils/navigation'

const menuOpen = ref(false)
const route = useRoute()

const mobileItems = computed(() => {
  const base = [...navItems]
  if (import.meta.dev) base.push({ name: 'DEV · Review', href: '/dev/review' })
  return base
})

watch(() => route.path, () => {
  menuOpen.value = false
})

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
      <NuxtLink
        v-for="item in mobileItems"
        :key="item.name"
        :to="item.href"
        class="mobile-item"
        :class="{ 'mobile-item-active': isActive(item.href) }"
        @click="menuOpen = false"
      >
        {{ item.name }}
      </NuxtLink>
    </nav>
  </div>
</template>

<style scoped>
.nav-wrapper {
  background: var(--smoke);
  backdrop-filter: blur(14px);
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
  height: 68px;
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
  flex-shrink: 0;
}

.logo-text {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.45rem;
  font-weight: 700;
  color: var(--paper);
  letter-spacing: -0.03em;
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
  min-width: 0;
}

.search-wrap {
  display: flex;
  align-items: center;
  min-width: 0;
}

/* ── Hamburger button ── */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 38px;
  height: 38px;
  background: none;
  border: 1px solid #3D3530;
  border-radius: 999px;
  cursor: pointer;
  padding: 7px;
  flex-shrink: 0;
  transition: border-color 0.15s, background 0.15s;
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

.hamburger:hover {
  border-color: rgba(249, 140, 53, 0.45);
  background: rgba(249, 140, 53, 0.05);
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
  box-shadow: 0 18px 30px rgba(0, 0, 0, 0.18);
}

.mobile-item {
  display: block;
  padding: 1rem 1.25rem;
  color: #C4BAB0;
  text-decoration: none;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.82rem;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  border-bottom: 1px solid #2D2822;
  transition: color 0.15s, background 0.15s;
  min-height: 3rem;
  display: flex;
  align-items: center;
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
    height: 64px;
  }

  .logo-text {
    font-size: 1.08rem;
  }

  .logo-img {
    width: 40px;
    height: 40px;
  }

  .nav-right {
    gap: 0.55rem;
  }
}

@media screen and (max-width: 700px) {
  .nav-inner {
    padding: 0 0.8rem;
    height: 60px;
    gap: 0.6rem;
  }

  .nav-logo {
    gap: 0.5rem;
  }

  .logo-img {
    width: 36px;
    height: 36px;
  }

  .search-wrap :deep(button) {
    min-height: 34px;
    padding-left: 0.72rem;
    padding-right: 0.72rem;
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    border-radius: 999px;
  }

  .search-wrap :deep(kbd) {
    display: none;
  }
}

@media screen and (max-width: 850px) {
  .hamburger {
    display: flex;
  }
}

@media screen and (max-width: 500px) {
  .nav-inner {
    padding: 0 0.7rem;
  }

  .logo-text {
    display: none;
  }

  .nav-logo {
    gap: 0;
  }

  .logo-img {
    width: 34px;
    height: 34px;
  }

  .nav-right {
    gap: 0.45rem;
  }

  .search-wrap :deep(button) {
    min-height: 32px;
    padding-left: 0.62rem;
    padding-right: 0.62rem;
    font-size: 0.68rem;
    letter-spacing: 0.07em;
  }

  .mobile-item {
    padding: 0.92rem 1rem;
    font-size: 0.78rem;
  }
}
</style>
