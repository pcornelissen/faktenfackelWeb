<script setup lang="ts">
import SectionsOverview from '~/components/overview/SectionsOverview.vue'
import Heading from '~/components/layout/Heading.vue'
import PostsList from '~/components/content/PostsList.vue'
import { definePageData, nowIso } from '~/utils/contentUtils'
import type { Post } from '~/utils/contentUtils'

await definePageData({
  title: 'Faktenchecks - Faktenfackel',
  pageHeading: 'Faktenfackel - Faktenchecks',
  pageSubHeading: 'Themenbereiche',
})

const { data: recentList } = await useAsyncData('faktenchecks-recent-overview', () => {
  return queryCollection('faktenchecks')
    .select('title', 'subtitle', 'path', 'publishedOn', 'tags', 'date', 'verdict')
    .where('date', '<=', nowIso())
    .order('date', 'DESC')
    .all()
})
const recent = (recentList.value || []) as Post[]
</script>

<template>
  <div class="wide">
    <Heading
      as="h1"
      title="Faktenchecks"
      icon="fake-news"
      icon-txt="Freepik Icon von Scherz Infinite Dendrogram"
    />
    <p class="intro">
      Hier prüfen wir konkrete Behauptungen aus Politik, Medien und sozialen Netzwerken auf ihren Wahrheitsgehalt –
      mit belegten Quellen und einem klaren Urteil. Die Faktenchecks sind nach Themenbereichen gegliedert,
      damit du gezielt nach dem suchen kannst, was dich interessiert.
    </p>
    <SectionsOverview />

    <div class="recent-header">
      <h2 class="recent-title">
        Neueste Faktenchecks
      </h2>
    </div>
    <PostsList
      :list="recent"
      :page-size="10"
    />
  </div>
</template>

<style scoped>
.intro {
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.7;
  max-width: 60ch;
  margin-bottom: 2rem;
}

.recent-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: 2.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.8rem;
  border-bottom: 2px solid var(--ink);
}

.recent-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--ink);
  margin: 0;
}
</style>
