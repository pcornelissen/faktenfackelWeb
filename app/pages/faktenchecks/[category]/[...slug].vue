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
  }).where('path', 'NOT LIKE', '%_info').where('publishedOn', '<=', nowIso())
})

const { data: page } = await useAsyncData(
  `faktencheck-${slug}`,
  () => queryCollection('faktenchecks').path(basePath).where('publishedOn', '<=', nowIso()).first(),
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Faktencheck nicht gefunden' })
}

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

defineOgImage('Faktencheck', {
  title,
  verdict: page.value?.verdict || 'false',
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
      <div class="article-shell">
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
          class="article-alert"
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
    </div>

    <div v-else>
      Diese Seite existiert nicht!
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
  margin: 0 0 0.8rem;
  line-height: 0.98;
  letter-spacing: -0.04em;
  font-size: clamp(2.4rem, 5vw, 4rem);
  max-width: 12ch;
}

.article-verdict {
  display: inline-block;
  margin: 0.35rem 0 0.9rem;
}

.article-tags {
  margin-top: 0.4rem;
}

.article-subtitle {
  font-size: clamp(1.2rem, 2vw, 1.45rem);
  color: var(--muted);
  font-weight: 400;
  margin: 0;
  line-height: 1.48;
  max-width: 34ch;
}

.article-alert {
  margin: 1.3rem 1.5rem 0;
}

.article-body {
  margin-top: 0;
  padding: 1.8rem 2.75rem 2.8rem;
}

/* ── TOC ── */
.article-toc {
  margin: 0 0 2rem;
  padding: 1.15rem 1.3rem;
  background: #FCF7F0;
  border: 1px solid var(--fackel-border);
  border-left: 4px solid var(--flame);
  border-radius: 1rem;
}

.toc-title {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.78rem;
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
  font-size: 0.98rem;
  color: var(--ink);
  text-decoration: none;
  line-height: 1.5;
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
  margin-top: 0.75rem;
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
}

.surround-sub {
  font-size: 0.92rem;
  color: var(--muted);
  line-height: 1.48;
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
  }

  .surround-empty {
    display: none;
  }
}
</style>
