<script setup lang="ts">
import { useAsyncData, useRoute } from 'nuxt/app'
import { definePageData, nowIso } from '~/utils/contentUtils'

const route = useRoute()
const basePath = route.path

const { data: page } = await useAsyncData(
  `news-${basePath}`,
  () => queryCollection('news').path(basePath).where('publishedOn', '<=', nowIso()).first(),
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'News-Eintrag nicht gefunden' })
}

const title = page.value.title

await definePageData({
  title: `${title} - Faktenfackel`,
  pageHeading: title,
  pageSubHeading: 'News',
})

useSeoMeta({
  title: `${title} - Faktenfackel`,
})

const lastChange = dateString(page.value.date as string)
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
        <div class="article-headline">
          {{ lastChange }}
        </div>
        <h1 class="article-title">
          {{ page.title }}
        </h1>
      </div>

      <div
        v-if="page.body"
        class="article-body content"
      >
        <ContentRenderer :value="page" />
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

@media screen and (max-width: 560px) {
  .article-header {
    padding: 1.8rem 1.2rem 1.3rem;
  }

  .article-body {
    padding: 1.25rem 1.2rem 2rem;
  }
}
</style>
