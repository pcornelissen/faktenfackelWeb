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
        <div class="flex flex-row grow">
          <div class="flex-auto ml-2">
            <NuxtLink
              :to="item.path"
              class="link"
            >
              {{ item.subject || item.title }}
            </NuxtLink>
            <div class="flex flex-row">
              <div
                v-if="item.subtitle"
                class="text-sm subtitle grow"
              >
                {{ item.subtitle }}
              </div>
              <div
                class="lastChange block-fit"
                :title="'Veröffentlicht: '+dateString(item.publishedOn)"
              >
                Stand {{ dateString(item.date) }}
              </div>
            </div>
            <div
              v-if="item.description"
              class="text-sm description"
            >
              {{ item.description }}
            </div>
            <Tag
              v-for="tag in item.tags"
              :key="tag"
              :tag="tag"
            />
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

.lastChange {
  font-size: 0.6rem;
  font-weight: 200;
  margin-bottom: 0.4rem;
  margin-top: -1em;
}

.subtitle {
  color: gray;
  margin-top: -0.6em;
  margin-bottom: 0.6em;
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
</style>
