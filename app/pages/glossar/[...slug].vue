<script setup lang="ts">
import { definePageData, nowIso } from '~/utils/contentUtils'

const route = useRoute()
const slug = (route.params.slug as string[]).join('/')
const basePath = route.path

const { data: surround } = await useAsyncData(`${route.path}-surround`, () => {
  return queryCollectionItemSurroundings('glossar', basePath, {}).where('publishedOn', '<=', nowIso())
})

const { data: page } = await useAsyncData(
  `glossar-${slug}`,
  () => queryCollection('glossar').path(basePath).where('publishedOn', '<=', nowIso()).first(),
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Glossar-Eintrag nicht gefunden' })
}

const title = page.value?.title || `Glossar`

await definePageData({
  title: title + ' - Faktenfackel Glossar',
  pageHeading: title,
  pageSubHeading: '',
  description: page.value?.description,
  lastmod: new Date(page.value?.date || new Date()),
})

const lastChangeStr = page.value?.date as string | null || ''
const lastChange = dateString(lastChangeStr)
</script>

<template>
  <div>
    <BackLink to="/glossar">
      Zurück zum Glossar
    </BackLink>

    <div v-if="page">
      <div class="article-header">
        <div class="article-headline">
          Stand: {{ lastChange }}
        </div>
        <h1 class="article-title">
          {{ page.title }}
        </h1>
        <p
          v-if="page.description"
          class="article-subtitle"
        >
          {{ page.description }}
        </p>
      </div>

      <div class="article-body content">
        <ContentRenderer
          v-if="page.body"
          :value="page"
        />
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

    <div v-else>
      Diese Seite existiert nicht!
    </div>
  </div>
</template>

<style scoped>
.article-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--fackel-border);
}

.article-headline {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--flame);
  margin-bottom: 0.5rem;
}

.article-title {
  margin: 0 0 0.4rem;
  line-height: 1.15;
}

.article-subtitle {
  font-size: 1.05rem;
  color: var(--muted);
  font-weight: 300;
  margin: 0;
  line-height: 1.5;
}

.article-body {
  margin-top: 1.5rem;
}

/* ── SURROUND NAVIGATION ── */
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
  padding: 1rem 1.2rem;
  background: white;
  border: 1px solid var(--fackel-border);
  border-radius: 6px;
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
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--flame);
  font-weight: 600;
}

.surround-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.3;
}

@media screen and (max-width: 560px) {
  .surround-nav {
    grid-template-columns: 1fr;
  }

  .surround-empty {
    display: none;
  }
}
</style>
