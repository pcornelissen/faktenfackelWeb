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
  background: white;
  border: 1px solid var(--fackel-border);
  border-radius: 6px;
  overflow: hidden;
}

.sidebar-box-header {
  padding: 10px 16px;
  background: var(--smoke);
  border-bottom: 1px solid #2D2822;
}

.sidebar-box-title {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
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
  border-bottom: 1px solid var(--fackel-border);
}

.link-list li:last-child {
  border-bottom: none;
}

.link-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0.6rem 1rem;
  text-decoration: none;
  transition: background 0.15s;
}

.link-item:hover {
  background: #FDFAF5;
}

.link-date {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.65rem;
  color: var(--muted);
  letter-spacing: 0.04em;
}

.link-title {
  font-size: 0.85rem;
  color: var(--ink);
  line-height: 1.4;
  transition: color 0.15s;
}

.link-item:hover .link-title {
  color: var(--flame);
}

.link-tags {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.62rem;
  color: var(--muted);
  letter-spacing: 0.04em;
}

.sidebar-box-footer {
  padding: 8px 16px;
  background: rgba(0,0,0,0.02);
  border-top: 1px solid var(--fackel-border);
}

.sidebar-box-footer a {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  color: var(--flame);
  text-decoration: none;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>
