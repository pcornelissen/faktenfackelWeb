<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { capitalize, dateString } from '~/utils/stringUtils'
import type { Post } from '~/utils/contentUtils'

const props = defineProps<{
  list: Post[]
  basePath: string
  href?: string
  icon?: string
}>()
</script>

<template>
  <nav class="navigation">
    <ul class="flex flex-col">
      <li
        v-for="item in props.list"
        :key="item.path"
        class="flex flex-row grow"
      >
        <Icon
          :icon="item.icon || props.icon || 'mdi:faq'"
          :ssr="true"
          height="32"
          width="32"
          style="flex-shrink: 0"
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
            <NuxtLink
              v-for="tag in item.tags"
              :key="tag"
              :to="`${props.basePath}/tags/${tag}`"
              class="tag"
            >
              {{ capitalize(tag) }}
            </NuxtLink>
          </div>
        </div>
      </li>
      <li v-if="props.list.length === 0">
        Es gibt noch keine Beiträge in diesem Bereich. Schau später nochmal vorbei!
      </li>
    </ul>
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
  background-color: #eee;
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

.tag {
  font-size: 0.8rem;
  font-weight: 200;
  background-color: var(--color-tertiary);
  color: #fff;
  padding: 0.2rem 0.4rem;
  margin: 0.2rem 0.4rem;
  border-radius: 0.2rem;
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
</style>
