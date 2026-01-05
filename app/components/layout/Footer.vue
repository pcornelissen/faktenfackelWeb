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
  <UFooter>
    <template #left>
      <a
        style="display: block"
        href="/impressum"
      >Impressum</a>
      <p class="text-sm text-muted">
        ©{{ date?.getFullYear() || '2026' }}
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

    <NuxtLink to="/about">Über uns</NuxtLink>
    <span style="padding: 0 1rem">//\\</span>
    <a
      style="display: block"
      href="https://mein.online-impressum.de/faktenfackel/"
    >Social Hub</a>

    <template #right>
      <NuxtLink to="/faq">Oft gestellte Fragen</NuxtLink>
      <NuxtLink to="/datenschutz">Datenschutzerklärung</NuxtLink>
      <NuxtLink to="/feed.xml">RSS</NuxtLink>
    </template>
  </UFooter>
</template>

<style scoped>
a:hover {
  text-decoration: underline;
}
</style>
