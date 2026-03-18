<script setup lang="ts">
import { dateString } from '~/utils/stringUtils'
import type { Post } from '~/utils/contentUtils'
import Tag from '~/components/sources/Tag.vue'

const props = defineProps<{
  list: Post[]
  href?: string
  icon?: string
  pageSize?: number
}>()

const { currentPage, totalPages, pageItems, goTo } = usePagination(() => props.list, props.pageSize ?? 20)

const MAX_VISIBLE_TAGS = 4

function visibleTags(tags: string[] | undefined) {
  return tags?.slice(0, MAX_VISIBLE_TAGS) ?? []
}

function extraTagCount(tags: string[] | undefined) {
  return Math.max(0, (tags?.length ?? 0) - MAX_VISIBLE_TAGS)
}
</script>

<template>
  <nav class="navigation">
    <ul class="flex flex-col">
      <li
        v-for="item in pageItems"
        :key="item.path"
        class="flex flex-row grow"
      >
        <UIcon
          :name="item.icon || props.icon || 'mdi:faq'"
          class="item-icon size-8"
        />
        <div class="flex flex-row grow gap-2">
          <div class="flex-auto ml-2">
            <NuxtLink
              :to="item.path"
              class="link"
            >
              {{ item.subject || item.title }}
            </NuxtLink>
            <div
              v-if="item.subtitle"
              class="text-sm subtitle"
            >
              {{ item.subtitle }}
            </div>
            <div
              v-if="item.description"
              class="text-sm description"
            >
              {{ item.description }}
            </div>
            <Tag
              v-for="tag in visibleTags(item.tags)"
              :key="tag"
              :tag="tag"
            />
            <span
              v-if="extraTagCount(item.tags) > 0"
              class="tag-more"
            >+{{ extraTagCount(item.tags) }}</span>
          </div>
          <div class="meta-right">
            <VerdictLabel
              v-if="item.verdict"
              :type="item.verdict"
              class="verdict-badge"
            />
            <div
              class="lastChange"
              :title="'Veröffentlicht: '+dateString(item.publishedOn)"
            >
              Stand {{ dateString(item.date) }}
            </div>
          </div>
        </div>
      </li>
      <li v-if="props.list.length === 0">
        Es gibt noch keine Beiträge in diesem Bereich. Schau später nochmal vorbei!
      </li>
    </ul>
    <PagerNav
      :current-page="currentPage"
      :total-pages="totalPages"
      @go="goTo"
    />
  </nav>
</template>

<style scoped>
li {
  font-size: 1rem;
  margin-bottom: 1rem;
  list-style: none;
  border-radius: 0.3rem;
  padding: 0.5rem;
}

li:hover {
  background-color: #FAF6F0;
}

.link {
  display: block;
  margin-bottom: 0.4rem;
}

.meta-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  gap: 0.25rem;
}

.lastChange {
  font-size: 0.6rem;
  font-weight: 200;
  white-space: nowrap;
}

.subtitle {
  color: gray;
  margin-top: -0.3em;
  margin-bottom: 0.4em;
  font-size: 0.7em;
}

.description {
  font-size: 0.8em;
  margin-bottom: 0.5em;
}

.item-icon {
  flex-shrink: 0;
  color: var(--flame);
  opacity: 0.85;
}

.verdict-badge {
  font-size: 0.75em;
}

.tag-more {
  font-size: 0.75rem;
  color: var(--muted);
  background: #F0EBE3;
  border: 1px solid var(--fackel-border);
  padding: 0.2rem 0.4rem;
  border-radius: 0.2rem;
  white-space: nowrap;
  align-self: center;
  margin: 0.2rem 0.3rem;
}
</style>
