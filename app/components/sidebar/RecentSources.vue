<script setup lang="ts">
import { nowIso } from '~/utils/contentUtils'

const { data: recentLinksRaw } = await useAsyncData('recent-quellenlinks', () =>
  queryCollection('quellenlinks')
    .select('path', 'title', 'date', 'tags')
    .where('publishedOn', '<=', nowIso())
    .order('date', 'DESC')
    .limit(3)
    .all(),
)
const recentLinks = recentLinksRaw.value as SourceLink[]
</script>

<template>
  <div class="sidebar-box">
    <div class="sidebar-box-header">
      <span class="sidebar-box-title">
        <UIcon
          name="mdi:link-plus"
          class="size-3.5"
        /> Neue Quellenlinks
      </span>
    </div>
    <ul class="link-list">
      <li
        v-for="link in recentLinks"
        :key="link.path"
      >
        <NuxtLink
          :to="link.path"
          class="link-item"
        >
          <span class="link-date">{{ dateString(link.date) }}</span>
          <span class="link-title">{{ link.title }}</span>
          <span
            v-if="link.tags?.length"
            class="link-tags"
          >{{ link.tags.slice(0, 2).join(' · ') }}</span>
        </NuxtLink>
      </li>
    </ul>
    <div class="sidebar-box-footer">
      <NuxtLink to="/quellen">
        Alle Quellen <UIcon
          name="mdi:arrow-right"
          class="size-3"
        />
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.sidebar-box {
  background: linear-gradient(180deg, white, #FBF6EF);
  border: 1px solid var(--fackel-border);
  border-radius: 1.1rem;
  overflow: hidden;
  box-shadow: 0 10px 24px rgba(31, 22, 15, 0.04);
}

.sidebar-box-header {
  padding: 1rem 1rem 0.5rem;
}

.sidebar-box-title {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.74rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--flame);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.link-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.link-list li {
  border-top: 1px solid var(--fackel-border);
}

.link-list li:first-child { border-top: none; }

.link-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.95rem 1rem;
  text-decoration: none;
  transition: background 0.15s, transform 0.15s;
}

.link-item:hover {
  background: rgba(255,255,255,0.75);
}

.link-date {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.72rem;
  color: var(--muted);
  letter-spacing: 0.06em;
}

.link-title {
  font-size: 0.96rem;
  color: var(--ink);
  line-height: 1.45;
  transition: color 0.15s;
}

.link-item:hover .link-title {
  color: var(--flame);
}

.link-tags {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.7rem;
  color: var(--muted);
  letter-spacing: 0.04em;
}

.sidebar-box-footer {
  padding: 0.9rem 1rem 1rem;
  border-top: 1px solid var(--fackel-border);
}

.sidebar-box-footer a {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.78rem;
  color: var(--ember);
  text-decoration: none;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>
