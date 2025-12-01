<script setup lang="ts">
import Header from '~/components/layout/Header.vue'
</script>

<template>
  <Header />
  <USeparator color="primary" />

  <UMain class="content">
    <NuxtPage />
  </UMain>

  <USeparator color="primary" />

  <UFooter>
    <template #left>
      <p class="text-sm text-muted">
        ©{{ new Date().getFullYear() }}
      </p>
    </template>

    <NuxtLink to="/about">Über uns</NuxtLink>

    <template #right>
      <NuxtLink to="/faq">Oft gestellte Fragen</NuxtLink>
    </template>
  </UFooter>
</template>

<style>
  .content {
    margin-left: 2rem;
    margin-right: 2rem;
    margin-top: 2rem;
  }
</style>
