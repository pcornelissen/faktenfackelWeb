<script setup lang="ts">
import Header from '~/components/layout/Header.vue'
import { Icon } from '@iconify/vue'

const date = ref<Date>()

onMounted(() => {
  date.value = new Date()
})
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

  <UFooter>
    <template #left>
      <a
        style="display: block"
        href="/impressum"
        rel="nofollow"
      >Impressum</a>
      <p class="text-sm text-muted">
        ©{{ date?.getFullYear()||'2025' }}
      </p>
      <a
        href="https://buymeacoffee.com/faktenfackel"
        style="display: block ruby"
      >
        <Icon
          icon="mdi:coffee"
          :ssr="true"
          height="16"
        />
        Unterstütze uns</a>
    </template>

    <NuxtLink to="/about">Über uns</NuxtLink> <span style="padding: 0 1rem">//\\</span>
    <a
      style="display: block"
      href="https://mein.online-impressum.de/faktenfackel/"
      rel="nofollow"
    >Social Hub</a>

    <template #right>
      <NuxtLink to="/faq">Oft gestellte Fragen</NuxtLink>
      <NuxtLink to="/datenschutz">Datenschutzerklärung</NuxtLink>
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
