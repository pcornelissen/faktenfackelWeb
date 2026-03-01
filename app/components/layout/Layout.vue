<script setup lang="ts">
import Header from '~/components/layout/Header.vue'
import Footer from '~/components/layout/Footer.vue'
</script>

<template>
  <Header />
  <main class="main-content">
    <NuxtPage />
  </main>
  <Footer />
</template>

<style>
/* Default page content padding – index.vue overrides this with full-bleed sections */
.main-content {
  min-height: 60vh;
}

/* Inner pages get padding + max-width for readability */
.main-content:not(.no-padding) > *:not(.full-bleed) {
  padding-left: 2rem;
  padding-right: 2rem;
  padding-top: 2rem;
  max-width: 860px;
}

/* Wide pages (Quellen, Homepage body) can opt out */
.main-content:not(.no-padding) > .wide {
  max-width: 1200px;
}

@media screen and (max-width: 900px) {
  .main-content:not(.no-padding) > *:not(.full-bleed) {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
