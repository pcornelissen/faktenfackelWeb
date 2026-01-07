<script setup lang="ts">
import { capitalize } from '~/utils/stringUtils'
import type { Source } from '~/utils/contentUtils'

const props = defineProps<{
  list: Source[]
  basePath: string
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
        <div class="flex flex-row">
          <div class="flex-auto ml-2">
            <NuxtLink
              :to="item.path"
              class="link"
            >
              {{ item.name }}
            </NuxtLink>
            <div
              v-if="item.description"
              class="description mb-2"
            >
              {{ item.description }}
            </div>

            <!-- suppress HtmlUnknownTarget -->
            <NuxtLink
              v-for="tag in item.tags"
              :key="tag"
              :to="`/quellen/tags/${tag}`"
              class="tag"
            >
              {{ capitalize(tag) }}
            </NuxtLink>
            <br>
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
  display: inline-flex;
  margin-bottom: 0.4rem;
}

.description {
  font-size: 0.8rem;
  font-weight: 200;
  color: #999;
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
