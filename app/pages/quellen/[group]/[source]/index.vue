<script setup lang="ts">
import { capitalize } from '~/utils/stringUtils'
import { definePageData, nowIso } from '~/utils/contentUtils'
import { useReferencesStore, type SourceLink } from '~/utils/referenceData'
import SourceLinksList from '~/components/sources/SourceLinksList.vue'
import { calculateSourceImg, calculateSourceImgAuthor, extractNameFromPath } from '~/pages/quellen/[group]/sources'

const route = useRoute()
const referencesStore = useReferencesStore()

const source = route.params.source as string
const basePath = route.path

const { data: sourceInfo }
  = await
  useAsyncData(
    `quellen-${source}`,
    () => {
      return queryCollection('quellen').path(`${basePath}`).first()
    })

const title = sourceInfo.value?.name || capitalize(source)

await definePageData({
  title: title,
  pageHeading: 'Quelle: ' + title,
  pageSubHeading: sourceInfo.value?.description || 'Quelleninformation',
  description: sourceInfo.value?.description
    ? `${title}: ${sourceInfo.value.description} – Quelleninformation, Links und Bewertung auf Faktenfackel.`
    : `Quelleninformation zu ${title} – gesammelte Links, Zitate und Faktenfackel-Bewertung.`,
  lastmod: new Date(sourceInfo.value?.date || new Date()),
})

const { data: list1 } = await useAsyncData(basePath + '/links/', () => {
  return queryCollection('quellenlinks')
    .where('path', 'LIKE', basePath + '/links/%')
    .where('publishedOn', '<=', nowIso())
    .select('date', 'title', 'uri', 'type', 'tags', 'path')
    .all()
    .catch(() => [])
})
const list = (list1.value || []) as SourceLink[]

const coSource = extractNameFromPath(basePath)

const { data: coList1 }
  = await useAsyncData(basePath + '-colinks', () => {
    return queryCollection('quellenlinks').where('coSources', 'LIKE', '%"' + coSource + '"%').where('publishedOn', '<=', nowIso())
      .all()
      .catch(() => [])
  })
const coList = (coList1.value || []) as SourceLink[]

const { data: quotesRaw }
  = await useAsyncData(basePath + '-quotes', () =>
    queryCollection('zitate').where('path', 'LIKE', basePath + '/%').where('publishedOn', '<=', nowIso())
      .all()
      .catch(() => []))
const quotes = (quotesRaw.value || []) as Quote[]

await referencesStore.fetchFor(sourceInfo.value)
</script>

<template>
  <div
    v-if="sourceInfo"
    class="wide"
  >
    <div class="source-shell">
      <div class="source-header">
        <div class="source-kicker">
          Quelle
        </div>
        <h1 class="source-title">
          {{ title }}
        </h1>
        <p
          v-if="sourceInfo.description"
          class="source-subtitle"
        >
          {{ sourceInfo.description }}
        </p>
        <div class="source-brand">
          <img
            :src="calculateSourceImg(sourceInfo)"
            :title="calculateSourceImgAuthor(sourceInfo)"
            :alt="calculateSourceImgAuthor(sourceInfo)"
            width="180"
            height="180"
            class="img"
            @error="(e) => ((e.target as HTMLImageElement).src = '/default-profile.webp')"
          >
          <div class="source-author">
            {{ calculateSourceImgAuthor(sourceInfo) }}
          </div>
        </div>
      </div>

      <UAlert
        v-if="sourceInfo.tags?.includes('more-research-needed')"
        color="neutral"
        variant="subtle"
        icon="i-lucide-search"
        title="Die Informationen zu dieser Quelle sind noch nicht vollständig und werden bald erweitert."
        class="source-alert"
      />

      <div class="layout">
        <div class="intro">
          <ContentRenderer
            v-if="sourceInfo"
            :value="sourceInfo"
          />
        </div>
        <div
          v-if="list.length > 0 || coList.length > 0 || quotes.length > 0"
          class="sidebar"
        >
          <div
            v-if="quotes.length > 0"
            class="sidebar-block"
          >
            <h2 class="sidebar-title">
              Zitate
            </h2>
            <QuotesList
              :list="quotes"
            />
          </div>
          <SourceLinksList
            v-if="list.length > 0"
            :list="list"
          />
          <SourceLinksList
            v-if="coList.length > 0"
            :list="coList"
            title-override="Involviert bei den Links"
          />
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    Quelle nicht gefunden
  </div>
</template>

<style scoped>
.source-shell {
  background: rgba(255, 255, 255, 0.68);
  border: 1px solid rgba(231, 222, 208, 0.9);
  border-radius: 1.6rem;
  box-shadow: 0 18px 50px rgba(47, 26, 11, 0.06);
  overflow: hidden;
}

.source-header {
  padding: 2.5rem 2.75rem 1.7rem;
  background:
    radial-gradient(circle at top right, rgba(232, 68, 10, 0.1), transparent 32%),
    linear-gradient(180deg, white, #FCF8F3);
  border-bottom: 1px solid var(--fackel-border);
}

.source-kicker {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--flame);
  margin-bottom: 0.9rem;
}

.source-title {
  margin: 0 0 0.8rem;
  line-height: 0.98;
  letter-spacing: -0.04em;
  font-size: clamp(2.4rem, 5vw, 4rem);
  max-width: 12ch;
}

.source-subtitle {
  font-size: clamp(1.2rem, 2vw, 1.45rem);
  color: var(--muted);
  font-weight: 400;
  margin: 0;
  line-height: 1.48;
  max-width: 34ch;
  text-wrap: balance;
}

.source-brand {
  margin-top: 1.35rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
}

.img {
  max-width: 180px;
  max-height: 180px;
  object-fit: contain;
  border-radius: 1rem;
  background: white;
  padding: 0.8rem;
  border: 1px solid var(--fackel-border);
}

.source-author {
  font-size: 0.82rem;
  color: var(--muted);
  font-family: 'Ubuntu Mono', monospace;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.source-alert {
  margin: 1.3rem 1.5rem 0;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) clamp(260px, 30%, 380px);
  gap: 2rem;
  align-items: start;
  padding: 1.8rem 2.75rem 2.8rem;
}

.sidebar {
  min-width: 0;
}

.sidebar-block {
  margin-bottom: 2rem;
}

.sidebar-title {
  margin: 0 0 1rem;
  line-height: 0.98;
  letter-spacing: -0.03em;
}

.intro :deep(p),
.intro :deep(ul),
.intro :deep(ol) {
  max-width: 65ch;
}

@media screen and (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 1.2rem 1.15rem 2rem;
  }

  .img {
    max-width: 140px;
    max-height: 140px;
  }

  .sidebar-block {
    margin-bottom: 1.5rem;
  }
}

@media screen and (max-width: 560px) {
  .source-header {
    padding: 1.65rem 1.05rem 1.15rem;
  }

  .source-kicker {
    font-size: 0.72rem;
    letter-spacing: 0.09em;
    margin-bottom: 0.75rem;
  }

  .source-title {
    margin-bottom: 0.65rem;
    max-width: 10ch;
  }

  .source-subtitle {
    font-size: 1.05rem;
    line-height: 1.42;
  }

  .source-brand {
    margin-top: 1rem;
    gap: 0.55rem;
  }

  .img {
    max-width: 112px;
    max-height: 112px;
    padding: 0.65rem;
  }

  .source-author {
    font-size: 0.72rem;
  }

  .source-alert {
    margin: 1rem 1rem 0;
  }

  .layout {
    gap: 1.3rem;
    padding: 1.05rem 1.05rem 1.75rem;
  }

  .sidebar-title {
    margin-bottom: 0.8rem;
  }
}
</style>
