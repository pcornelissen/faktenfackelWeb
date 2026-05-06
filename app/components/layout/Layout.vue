<script setup lang="ts">
import Header from '~/components/layout/Header.vue'
import Footer from '~/components/layout/Footer.vue'

withDefaults(defineProps<{ hideFooter?: boolean }>(), { hideFooter: false })
</script>

<template>
  <div :class="hideFooter ? 'flex h-screen flex-col overflow-hidden' : 'flex min-h-screen flex-col'">
    <Header />
    <main :class="hideFooter ? 'flex-1 min-h-0 overflow-hidden' : 'main-content flex-1'">
      <NuxtPage />
    </main>
    <Footer v-if="!hideFooter" />
  </div>
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
  margin-left: auto;
  margin-right: auto;
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
