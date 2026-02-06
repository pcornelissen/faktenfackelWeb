<script setup lang="ts">
import Layout from '~/components/layout/Layout.vue'

const route = useRoute()

const meta = route.meta

const title = (meta.title || 'Faktenfackel') as string
const description = (meta.description || 'Wir bringen Licht ins Dunkel') as string
const image = (meta.image || '/img/logo.webp') as string

useHead({
  title: title,
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico', type: 'image/x-icon' },
    { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    { rel: 'icon', href: '/favicon.png', type: 'image/png' },
  ],
  htmlAttrs: {
    lang: 'de-DE',
  },
})

useSeoMeta({
  title: title,
  description: description,
  ogTitle: title,
  ogDescription: description,
  ogImage: image,
  twitterImage: image,
  twitterCard: 'summary',
})
</script>

<template>
  <UApp>
    <Layout>
      <NuxtPage />
    </Layout>
  </UApp>
</template>
