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
    <ul>
      <li
        v-for="item in props.list"
        :key="item.path"
        class="flex flex-row"
      >
        <Icon
          :icon="props.icon ||'mdi:faq'"
          :ssr="true"
          height="32"
        />
        <div class="flex flex-row">
          <div class="flex-auto ml-2">
            <NuxtLink
              :to="item.path"
              class="link"
            >
              {{ item.subject || item.title }}
            </NuxtLink>

            <!-- suppress HtmlUnknownTarget -->
            <NuxtLink
              v-for="tag in item.tags"
              :key="tag"
              :to="`${props.basePath}/tags/${tag}`"
              class="tag"
            >
              {{ capitalize(tag) }}
            </NuxtLink>
            <br>
            <span
              class="lastChange"
              :title="'Veröffentlicht: '+dateString(item.publishedOn)"
            >Stand {{ dateString(item.date) }}</span>
          </div>
        </div>
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
</style>
