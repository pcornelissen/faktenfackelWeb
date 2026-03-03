<script setup lang="ts">
import Heading from '~/components/layout/Heading.vue'
import { definePageData } from '~/utils/contentUtils'

const route = useRoute()

await definePageData({
  title: 'Zitate',
  pageHeading: 'Faktenfackel - Zitate',
  pageSubHeading: 'Originalzitate zu verschiedenen Themen',
  description: '',
})

const limit = 10
const { data: list1 } = await useAsyncData(route.path, () => {
  return queryCollection('zitate')
    .limit(limit)
    .all()
})
const list = list1.value as Quote[]
</script>

<template>
  <div
    v-if="list"
  >
    <Heading
      as="h1"
      title="Zitate"
      icon="feedback"
      icon-txt="Feedback Icons erstellt von Freepik - Flaticon"
    />
    <nuxt-link
      to="/zitate/tags"
      class="tags-link"
    >
      <icon name="i-mdi:tag-multiple-outline" />
      Zu den Tags
    </nuxt-link>
    <p class="intro">
      Die Zitate sind jeweils einer Quelle zugeordnet. Wenn mehrere Personen involviert sind, sind sie im Text zum Zitat referenziert.
      Viele Zitate haben begleitende Einordnungen und Referenzen.
    </p>
    <h3 class="section-heading">
      Die letzten {{ limit }} Zitate
    </h3>
    <QuotesList
      :list="list"
      :show-source="true"
    />
  </div>
  <div v-else>
    Moment! Keine Zitate gefunden, hier ist etwas kaputt!<br>
    <br>
    <NuxtLink to="/">
      Zurück zur Startseite
    </NuxtLink>
  </div>
</template>

<style scoped>
.tags-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.8rem;
  color: var(--muted);
  text-decoration: none;
  border: 1px solid var(--fackel-border);
  border-radius: 4px;
  padding: 4px 10px;
  margin-bottom: 1.5rem;
  transition: border-color 0.15s, color 0.15s;
}

.tags-link:hover {
  border-color: var(--ember);
  color: var(--ember);
}

.intro {
  color: var(--muted);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.section-heading {
  font-size: 1.1rem;
  margin: 0 0 1rem;
}
</style>
