<script setup lang="ts">
import Layout from '~/components/layout/Layout.vue'

const route = useRoute()

const title = computed(() => (route.meta.title as string) || 'Faktenfackel')
const description = computed(() => (route.meta.description as string) || 'Faktenfackel prüft Behauptungen, entlarvt Mythen und ordnet Aussagen aus Politik und Medien mit belastbaren Quellen ein.')
const image = computed(() => (route.meta.image as string) || '/img/logo.webp')

const { url: siteUrl } = useSiteConfig()
const canonicalPath = computed(() => {
  const p = route.path
  if (p === '/' || p.endsWith('/')) return p
  return `${p}/`
})
const absoluteImage = computed(() => {
  const src = image.value
  if (src.startsWith('http://') || src.startsWith('https://')) return src
  return `${siteUrl}${src.startsWith('/') ? src : `/${src}`}`
})

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
    'https://www.youtube.com/@Faktenfackel',
  ],
}

useHead(computed(() => ({
  title: title.value,
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico', type: 'image/x-icon' },
    { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml', sizes: 'any' },
    { rel: 'icon', href: '/favicon.png', type: 'image/png' },
    { rel: 'canonical', href: `${siteUrl}${canonicalPath.value}` },
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
})))

if (!import.meta.dev) {
  useScriptCloudflareWebAnalytics({ token: '23276c83d792476c91e176f0dad589fa' })
}

useSeoMeta({
  title: () => title.value,
  description: () => description.value,
  ogTitle: () => title.value,
  ogDescription: () => description.value,
  ogImage: () => absoluteImage.value,
  ogUrl: () => `${siteUrl}${canonicalPath.value}`,
  ogType: 'website',
  ogSiteName: 'Faktenfackel',
  twitterImage: () => absoluteImage.value,
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
