<script setup lang="ts">
import Tags from '~/components/sources/Tags.vue'
import { calculateSourceImg, calculateSourceImgAuthor } from '~/pages/quellen/[group]/sources'
import type { Source, SourceLink } from '~/utils/referenceData'

const props = defineProps<{
  entries: Array<{ source: Source, links: SourceLink[] }>
  pageSize?: number
}>()

const { currentPage, totalPages, pageItems, goTo } = usePagination(() => props.entries, props.pageSize ?? 10)
</script>

<template>
  <div class="link-groups">
    <div
      v-for="entry in pageItems"
      :key="entry.source.path"
      class="link-group"
    >
      <div class="link-group-header">
        <NuxtLink
          :to="entry.source.path"
          class="link-group-img-link"
        >
          <nuxt-img
            :src="calculateSourceImg(entry.source)"
            :alt="entry.source.name"
            :title="calculateSourceImgAuthor(entry.source)"
            loading="lazy"
            class="link-group-img"
          />
        </NuxtLink>
        <div class="link-group-info">
          <NuxtLink
            :to="entry.source.path"
            class="link-group-name-row"
          >
            <span class="link-group-name">{{ entry.source.name }}</span>
            <Icon
              name="i-lucide:arrow-right"
              class="link-group-arrow"
            />
          </NuxtLink>
          <Tags
            v-if="entry.source.tags?.length"
            :tags="entry.source.tags"
            class="link-group-tags"
          />
        </div>
      </div>
      <ul
        v-if="entry.links.length > 0"
        class="link-list"
      >
        <li
          v-for="link in entry.links"
          :key="link.path"
          class="link-item"
        >
          <a
            :href="link.uri"
            target="_blank"
            rel="noopener noreferrer"
            class="link-title"
          >
            <Icon
              name="i-lucide:external-link"
              class="link-icon"
            />
            {{ link.title }}
          </a>
          <Tags
            v-if="link.tags?.length"
            :tags="link.tags"
            class="link-item-tags"
          />
        </li>
      </ul>
    </div>
  </div>
  <PagerNav
    :current-page="currentPage"
    :total-pages="totalPages"
    @go="goTo"
  />
</template>

<style scoped>
.link-groups {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.link-group {
  border: 1px solid var(--fackel-border);
  border-radius: 4px;
  overflow: hidden;
  background: white;
}

.link-group-header {
  display: flex;
  flex-direction: row;
  background: #FDFAF5;
  border-bottom: 1px solid var(--fackel-border);
}

.link-group-img-link {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1rem;
  border-right: 1px solid var(--fackel-border);
  min-width: 6rem;
  flex-shrink: 0;
  transition: background 0.15s;
}

.link-group-img-link:hover {
  background: #FAF5EC;
}

.link-group-img {
  max-height: 5rem;
  max-width: 6rem;
  width: auto;
  object-fit: contain;
}

.link-group-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.link-group-name-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  text-decoration: none;
  transition: background 0.15s;
}

.link-group-name-row:hover {
  background: #FAF5EC;
}

.link-group-name {
  font-weight: 600;
  font-size: 1.05rem;
  color: var(--ink);
  flex: 1;
}

.link-group-arrow {
  color: var(--fackel-border);
  flex-shrink: 0;
  transition: color 0.15s, transform 0.15s;
}

.link-group-name-row:hover .link-group-arrow {
  color: var(--flame);
  transform: translateX(2px);
}

.link-group-tags {
  padding: 0 1rem 0.2rem calc(1rem - 0.3rem);
}

.link-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.link-item {
  border-bottom: 1px solid var(--fackel-border);
}

.link-item:last-child {
  border-bottom: none;
}

.link-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1rem;
  font-size: 0.88rem;
  color: var(--ink);
  text-decoration: none;
  transition: color 0.15s, background 0.15s;
}

.link-title:hover {
  color: var(--flame);
  background: #FDFAF5;
}

.link-icon {
  color: var(--muted);
  font-size: 0.75rem;
  flex-shrink: 0;
}

.link-item-tags {
  padding: 0 1rem 0.4rem;
}

@media screen and (max-width: 650px) {
  .link-group-header {
    padding: 0.5rem 0.75rem;
  }
}
</style>
