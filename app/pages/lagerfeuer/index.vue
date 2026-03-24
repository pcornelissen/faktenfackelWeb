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
    .where('date', '<=', nowIso())
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
        Lagerfeuer sind die gemütlichen, lange brennenden Möglichkeiten der Zusammenkunft, bei denen wir uns austauschen
        können.
      </p>
      <p>
        Daher ist dies ist der Bereich, in dem wir <strong>dedizierte Ausarbeitungen</strong> von interessanten
        Themen veröffentlichen, die nicht unbedingt in die anderen Kategorien passen. <br>
        Hier teilen wir unsere <strong>Meinungen, Gedanken und Analysen</strong> zu
        verschiedenen Aspekten der Gesellschaft und darüber hinaus. Es ist ein Ort für tiefere
        Einblicke, <strong>persönliche Perspektiven</strong> und kreative Ideen, die über die üblichen Faktenchecks und
        Quellen Inhalte
        hinausgehen.
      </p>
      <p>
        Um nicht noch einen Bereich aufzumachen, werden hier auch gelegentlich als Blog <strong>Themen zur
          Faktenfackel an sich</strong> veröffentlicht.
      </p>
    </div>
    <div>
      <h2>Kategorien</h2>
      <CategoriesOverview />
    </div>
    <div class="recent-section">
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
.recent-section {
  margin-top: 2.5rem;
}

.recent-title {
  margin-bottom: 0.5rem;
}
</style>
