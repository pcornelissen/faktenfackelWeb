<script setup lang="ts">
import Layout from '~/components/layout/Layout.vue'

const route = useRoute()

const meta = route.meta

const title = (meta.title || 'Faktenfackel') as string
const description = (meta.description || 'Wir bringen Licht ins Dunkel') as string
const image = (meta.image || '/img/logo.webp') as string

const siteUrl = 'https://faktenfackel.de'

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  'name': 'Faktenfackel',
  'url': siteUrl,
  'logo': `${siteUrl}/img/logo.webp`,
  'email': 'kontakt@faktenfackel.de',
  'description': 'Unabhängige Faktencheck-Plattform für Deutschland',
  'sameAs': [
    'https://discord.faktenfackel.de',
  ],
}

useHead({
  title: title,
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico', type: 'image/x-icon' },
    { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    { rel: 'icon', href: '/favicon.png', type: 'image/png' },
    { rel: 'canonical', href: `${siteUrl}${route.path}` },
  ],
  htmlAttrs: {
    lang: 'de-DE',
  },
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(organizationJsonLd),
      key: 'organization',
    },
  ],
})

useSeoMeta({
  title: title,
  description: description,
  ogTitle: title,
  ogDescription: description,
  ogImage: image,
  ogUrl: `${siteUrl}${route.path}`,
  ogType: 'website',
  ogSiteName: 'Faktenfackel',
  twitterImage: image,
  twitterCard: 'summary_large_image',
  twitterSite: '@faktenfackel',
})
</script>

<template>
  <UApp>
    <Layout>
      <NuxtPage />
    </Layout>
  </UApp>
</template>
