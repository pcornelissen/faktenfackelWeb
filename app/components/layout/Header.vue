<script setup lang="ts">
import Menu from '~/components/layout/Menu.vue'
import SearchBar from '~/components/layout/SearchBar.vue'
</script>

<template>
  <div class="sticky top-0 z-50 nav-wrapper shadow-md">
    <header class="nav-inner">
      <NuxtLink to="/" class="nav-logo">
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

      <div class="search-wrap">
        <SearchBar />
      </div>
    </header>
    <div class="nav-accent-line" />
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

.search-wrap {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

@media screen and (max-width: 900px) {
  .nav-inner {
    padding: 0 1rem;
  }
  .logo-text {
    font-size: 1.1rem;
  }
}

@media screen and (max-width: 600px) {
  .search-wrap {
    display: none;
  }
}
</style>
