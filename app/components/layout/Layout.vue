<script setup lang="ts">
import Header from '~/components/layout/Header.vue'
import Footer from '~/components/layout/Footer.vue'
</script>

<template>
  <Header />

  <UMain
    class="content relative overflow-y-auto"
    as="main"
  >
    <NuxtPage />
  </UMain>

  <USeparator color="primary" />

  <Footer />
</template>

<style>
.content {
  margin-left: 2rem;
  margin-right: 2rem;
  margin-top: 2rem;
}
</style>
