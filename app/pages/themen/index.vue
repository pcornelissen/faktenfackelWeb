<script setup lang="ts">
import { definePageData, nowIso } from '~/utils/contentUtils'

type ThemePage = {
  title: string
  subtitle: string
  description: string
  intro: string
  path: string
  date: string
  tags: string[]
}

await definePageData({
  title: 'Themen: Faktenchecks, Quellen und Einordnung - Faktenfackel',
  pageHeading: 'Themen',
  pageSubHeading: 'Kuratierte Hubs zu wiederkehrenden Fragen',
  description: 'Themen-Hubs von Faktenfackel bündeln Faktenchecks, Quellen, Zitate, Glossarbegriffe und Analysen zu AfD, Desinformation, Migration, PKS, Energie und Wirtschaft.',
})

defineOgImage('Default', { title: 'Faktenchecks, Quellen und Einordnung', label: 'THEMEN' })

const { data: themesRaw } = await useAsyncData('themen-index', () =>
  queryCollection('themen')
    .select('title', 'subtitle', 'description', 'intro', 'path', 'date', 'publishedOn', 'tags')
    .where('publishedOn', '<=', nowIso())
    .order('title', 'ASC')
    .all(),
)

const themes = computed(() => (themesRaw.value || []) as unknown as ThemePage[])
</script>

<template>
  <div class="wide">
    <div class="theme-index-header">
      <div class="theme-kicker">
        Themen-Hubs
      </div>
      <h1>Themen</h1>
      <p>
        Die Themen-Hubs sammeln zusammenhängende Faktenchecks, Analysen, Quellen, Zitate und Glossarbegriffe. Sie sind kuratiert, werden aber zusätzlich aus passenden Tags ergänzt.
      </p>
    </div>

    <div class="theme-grid">
      <NuxtLink
        v-for="theme in themes"
        :key="theme.path"
        :to="theme.path"
        class="theme-card"
      >
        <span class="theme-card-kicker">Thema</span>
        <span class="theme-card-title">{{ theme.title }}</span>
        <span class="theme-card-subtitle">{{ theme.subtitle }}</span>
        <span class="theme-card-desc">{{ theme.description }}</span>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.theme-index-header {
  max-width: 70ch;
  margin-bottom: 2rem;
}

.theme-kicker,
.theme-card-kicker {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.76rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--flame);
  font-weight: 600;
}

.theme-index-header p {
  color: var(--muted);
  line-height: 1.7;
  margin-top: 0.6rem;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  gap: 1rem;
}

.theme-card {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  border: 1px solid var(--fackel-border);
  border-left: 4px solid var(--flame);
  border-radius: 0.5rem;
  background: white;
  padding: 1rem 1.1rem 1.05rem;
  text-decoration: none;
  color: var(--ink);
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
}

.theme-card:hover {
  border-color: #E6C6A7;
  box-shadow: 0 16px 34px rgba(31, 22, 15, 0.08);
  transform: translateY(-2px);
}

.theme-card-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 700;
  font-size: 1.3rem;
  line-height: 1.1;
}

.theme-card-subtitle {
  color: var(--ink);
  font-weight: 600;
  line-height: 1.35;
}

.theme-card-desc {
  color: var(--muted);
  line-height: 1.55;
  font-size: 0.94rem;
}
</style>
