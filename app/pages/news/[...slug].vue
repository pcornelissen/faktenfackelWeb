<script setup lang="ts">
import { useAsyncData, useRoute } from 'nuxt/app'
import { definePageData, nowIso } from '~/utils/contentUtils'

const route = useRoute()
const basePath = route.path

const { data: surround } = await useAsyncData(`${route.path}-news-surround`, () => {
  return queryCollectionItemSurroundings('news', basePath, {}).where('publishedOn', '<=', nowIso())
})

const { data: page } = await useAsyncData(
  `news-${basePath}`,
  () => queryCollection('news').path(basePath).where('publishedOn', '<=', nowIso()).first(),
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'News-Eintrag nicht gefunden' })
}

const title = page.value.title
const description = page.value.teaser || undefined

await definePageData({
  title: `${title} - Faktenfackel`,
  pageHeading: title,
  pageSubHeading: 'News',
  description,
})

useSeoMeta({
  title: `${title} - Faktenfackel`,
  description,
})

const lastChange = dateString(page.value.date as string)
const publishedDate = page.value.publishedOn || page.value.date
const publishedIso = publishedDate ? new Date(publishedDate as string | Date).toISOString().slice(0, 10) : ''
</script>

<template>
  <div>
    <BackLink to="/news/">
      Zurück zu Änderungen
    </BackLink>

    <div
      v-if="page"
      class="article-shell"
    >
      <div class="article-header">
        <time
          class="article-headline"
          :datetime="publishedIso"
        >
          {{ lastChange }}
        </time>
        <h1 class="article-title">
          {{ page.title }}
        </h1>
      </div>

      <div
        v-if="page.body"
        class="article-body content"
      >
        <ContentRenderer :value="page" />
        <USeparator
          v-if="surround?.filter(Boolean).length"
          class="my-8"
        />
        <div
          v-if="surround?.filter(Boolean).length"
          class="surround-nav"
        >
          <NuxtLink
            v-if="surround?.[0]"
            :to="(surround[0] as any).path"
            class="surround-card"
          >
            <div class="surround-dir">
              ← Vorheriger Eintrag
            </div>
            <div class="surround-title">
              {{ (surround[0] as any).title }}
            </div>
          </NuxtLink>
          <div
            v-else
            class="surround-card surround-empty"
          />
          <NuxtLink
            v-if="surround?.[1]"
            :to="(surround[1] as any).path"
            class="surround-card surround-card--right"
          >
            <div class="surround-dir">
              Nächster Eintrag →
            </div>
            <div class="surround-title">
              {{ (surround[1] as any).title }}
            </div>
          </NuxtLink>
          <div
            v-else
            class="surround-card surround-empty"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.article-shell {
  background: rgba(255, 255, 255, 0.68);
  border: 1px solid rgba(231, 222, 208, 0.9);
  border-radius: 1.6rem;
  box-shadow: 0 18px 50px rgba(47, 26, 11, 0.06);
  overflow: hidden;
}

.article-header {
  padding: 2.5rem 2.75rem 1.7rem;
  background:
    radial-gradient(circle at top right, rgba(232, 68, 10, 0.1), transparent 32%),
    linear-gradient(180deg, white, #FCF8F3);
  border-bottom: 1px solid var(--fackel-border);
}

.article-headline {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--flame);
  margin-bottom: 0.9rem;
}

.article-title {
  margin: 0;
  line-height: 1.1;
  letter-spacing: -0.03em;
  font-size: clamp(1.8rem, 4vw, 2.6rem);
}

.article-body {
  padding: 1.8rem 2.75rem 2.8rem;
}

.surround-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 0.5rem;
}

.surround-card {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 1.1rem 1.2rem;
  background: white;
  border: 1px solid var(--fackel-border);
  border-radius: 1rem;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
  position: relative;
}

.surround-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--flame);
  border-radius: 6px 6px 0 0;
  transform: scaleX(0);
  transition: transform 0.25s;
  transform-origin: left;
}

.surround-card--right::before {
  transform-origin: right;
}

.surround-card:hover {
  border-color: var(--flame);
  box-shadow: 0 4px 16px rgba(249, 140, 53, 0.1);
}

.surround-card:hover::before {
  transform: scaleX(1);
}

.surround-empty {
  background: transparent;
  border: none;
  pointer-events: none;
}

.surround-dir {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--flame);
  font-weight: 600;
}

.surround-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.08rem;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.15;
  text-wrap: balance;
}

@media screen and (max-width: 560px) {
  .article-header {
    padding: 1.8rem 1.2rem 1.3rem;
  }

  .article-body {
    padding: 1.25rem 1.2rem 2rem;
  }

  .surround-nav {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }

  .surround-empty {
    display: none;
  }

  .surround-card {
    padding: 0.95rem 1rem;
  }

  .surround-title {
    font-size: 1rem;
  }
}
</style>
