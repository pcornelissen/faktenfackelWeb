<script setup lang="ts">
import { useAsyncData, useRoute } from 'nuxt/app'
import { definePageData, nowIso } from '~/utils/contentUtils'
import { referencesStore } from '~/utils/referenceData'

const route = useRoute()

const category = route.params.category as string
const slug = (route.params.slug as string[]).join('/')

const categoryPath = `/faktenchecks/${category}`
const basePath = route.path

const { data: surround } = await useAsyncData(`${route.path}-surround`, () => {
  return queryCollectionItemSurroundings('faktenchecks', basePath, {
    fields: ['subtitle'],
  }).where('path', 'NOT LIKE', '%_info').where('date', '<=', nowIso())
})

const { data: page } = await useAsyncData(
  `faktencheck-${slug}`,
  () => queryCollection('faktenchecks').path(basePath).where('date', '<=', nowIso()).first(),
)

const title = page.value?.title || `Faktencheck`
const subtitle = page.value?.subtitle || `Faktencheck`

await definePageData({
  title: title + ' - Faktenfackel',
  pageHeading: title,
  pageSubHeading: subtitle as string,
  description: page.value?.description,
  lastmod: new Date(page.value?.date || new Date()),
})

useSeoMeta({
  title: title + ' - Faktenfackel',
  description: page.value?.description || subtitle,
  ogUrl: `https://faktenfackel.de${route.path}`,
  twitterCard: 'summary_large_image',
  articleModifiedTime: page.value?.date || new Date().toLocaleDateString(),
})

useClaimReview({
  title: page.value?.title || title,
  subtitle: page.value?.subtitle,
  url: route.path,
  dateModified: page.value?.date,
  datePublished: page.value?.publishedOn || undefined,
  verdict: page.value?.verdict,
})

const lastChangeStr = page.value?.date as string | null || ''
const lastChange = dateString(lastChangeStr)

await referencesStore.fetchFor(page.value)
</script>

<template>
  <div>
    <BackLink :to="categoryPath">
      Zurück zum Bereich {{ capitalize(category) }}
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
          v-if="page.subtitle"
          class="article-subtitle"
        >
          {{ page.subtitle }}
        </p>
        <VerdictLabel
          v-if="page.verdict !== undefined"
          :type="page.verdict"
          class="article-verdict"
        />
        <Tags
          v-if="page.tags?.length"
          :tags="(page.tags as string[])"
          class="article-tags"
        />
      </div>

      <UAlert
        v-if="!page.publishedOn || new Date(page.publishedOn) > new Date()"
        type="info"
        icon="i-lucide-badge-info"
        title="Achtung! Dieser Artikel ist aktuell in Bearbeitung und kann fehlende, falsche und unbelegte Informationen enthalten"
      />

      <div class="article-body content">
        <div
          v-if="(page.body as any)?.toc?.links?.length > 1"
          class="article-toc"
        >
          <div class="toc-title">
            Inhalt
          </div>
          <nav>
            <ol class="toc-list">
              <li
                v-for="link in (page.body as any).toc.links"
                :key="link.id"
              >
                <a :href="'#' + link.id">{{ link.text }}</a>
                <ol
                  v-if="link.children?.length"
                  class="toc-sub"
                >
                  <li
                    v-for="child in link.children"
                    :key="child.id"
                  >
                    <a :href="'#' + child.id">{{ child.text }}</a>
                  </li>
                </ol>
              </li>
            </ol>
          </nav>
        </div>

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
              ← Vorheriger Faktencheck
            </div>
            <div class="surround-title">
              {{ (surround[0] as any).title }}
            </div>
            <div
              v-if="(surround[0] as any).subtitle"
              class="surround-sub"
            >
              {{ (surround[0] as any).subtitle }}
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
              Nächster Faktencheck →
            </div>
            <div class="surround-title">
              {{ (surround[1] as any).title }}
            </div>
            <div
              v-if="(surround[1] as any).subtitle"
              class="surround-sub"
            >
              {{ (surround[1] as any).subtitle }}
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

.article-verdict {
  display: inline-block;
  margin: 0.5rem 0 0.75rem;
}

.article-tags {
  margin-top: 0.75rem;
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

/* ── TOC ── */
.article-toc {
  margin: 0 0 1.8rem;
  padding: 0.9rem 1.2rem;
  background: #FDFAF5;
  border: 1px solid var(--fackel-border);
  border-left: 3px solid var(--flame);
  border-radius: 4px;
}

.toc-title {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--flame);
  font-weight: 600;
  margin-bottom: 0.6rem;
}

.toc-list,
.toc-sub {
  list-style: none;
  margin: 0;
  padding: 0;
}

.toc-sub {
  padding-left: 1.2rem;
}

.toc-list li,
.toc-sub li {
  margin: 0.25rem 0;
}

.toc-list a,
.toc-sub a {
  font-size: 0.9rem;
  color: var(--ink);
  text-decoration: none;
}

.toc-list a:hover,
.toc-sub a:hover {
  color: var(--flame);
  text-decoration: underline;
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
  top: 0;
  left: 0;
  right: 0;
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

.surround-sub {
  font-size: 0.82rem;
  color: var(--muted);
  line-height: 1.4;
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
