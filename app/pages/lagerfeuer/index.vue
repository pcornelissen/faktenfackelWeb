<script setup lang="ts">
import Heading from '~/components/layout/Heading.vue'
import PostsList from '~/components/content/PostsList.vue'
import { definePageData, nowIso } from '~/utils/contentUtils'
import type { Post } from '~/utils/contentUtils'
import CategoriesOverview from '~/components/lagerfeuer/CategoriesOverview.vue'

await definePageData({
  title: 'Lagerfeuer – Analysen, Hintergründe & Blog | Faktenfackel',
  pageHeading: 'Fakte^nfackel - Lagerfeuer',
  pageSubHeading: 'Ausarbeitungen, Meinung, Blog',
  description: 'Vertiefende Artikel, Analysen, Hintergründe und Blog-Einträge zu politischen Themen – das Lagerfeuer von Faktenfackel.',
})

const { data: recentList } = await useAsyncData('lagerfeuer-recent-overview', () =>
  queryCollection('lagerfeuer')
    .select('title', 'subtitle', 'path', 'publishedOn', 'tags', 'date', 'description')
    .where('publishedOn', '<=', nowIso())
    .order('date', 'DESC')
    .all(),
)
// Filter out _info pages (they have no date and won't survive the date filter, but filter client-side too)
const recent = ((recentList.value || []) as Post[]).filter(p => !p.path.endsWith('/_info'))
</script>

<template>
  <div>
    <Heading
      as="h1"
      title="Lagerfeuer"
      icon="bonfire"
      icon-txt="Freepik Icon von @smashingstocks"
    />
    <div class="introduction">
      <p>
        Im Lagerfeuer erscheinen längere Einordnungen, Analysen und Gedankenstücke, die über den klassischen Faktencheck hinausgehen.
      </p>
      <p>
        Hier sammeln wir dedizierte Ausarbeitungen zu Themen, die mehr Kontext, mehr Haltung oder mehr Tiefe brauchen. Der Bereich soll sich wie der ruhigere zweite Pfad neben den Faktenchecks anfühlen.
      </p>
      <p>
        Gelegentlich erscheinen hier auch Beiträge zur Faktenfackel selbst, zu redaktionellen Überlegungen oder zu Themen, die bewusst essayistischer angelegt sind.
      </p>
    </div>
    <div class="section-block">
      <div class="section-kicker">
        Einordnung
      </div>
      <h2 class="section-title">
        Kategorien
      </h2>
      <CategoriesOverview />
    </div>
    <div class="recent-section">
      <div class="section-kicker">
        Neu
      </div>
      <h2 class="recent-title">
        Neueste Beiträge
      </h2>
      <PostsList
        :list="recent"
        :page-size="10"
      />
    </div>
  </div>
</template>

<style scoped>
.introduction {
  background: linear-gradient(180deg, white, #FCF8F3);
  border: 1px solid var(--fackel-border);
  border-left: 4px solid var(--flame);
  border-radius: 1rem;
  padding: 1.3rem 1.4rem;
  margin-bottom: 2.4rem;
  font-size: 1rem;
  color: var(--muted);
  line-height: 1.7;
}

.section-block {
  margin-bottom: 2.7rem;
}

.section-kicker {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.76rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--flame);
  font-weight: 600;
  margin-bottom: 0.45rem;
}

.recent-section {
  margin-top: 2.5rem;
}

.recent-title {
  margin-bottom: 1rem;
  line-height: 0.98;
  letter-spacing: -0.03em;
}

.section-title {
  margin-bottom: 1rem;
  line-height: 0.98;
  letter-spacing: -0.03em;
}

@media screen and (max-width: 560px) {
  .introduction {
    padding: 1rem 1rem 1.05rem;
  }
}
</style>
