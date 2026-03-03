<script setup lang="ts">
import type { Source } from '~/utils/referenceData'
import Tag from '~/components/sources/Tag.vue'

const props = defineProps<{
  list: Source[]
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

            <Tag
              v-for="tag in item.tags"
              :key="tag"
              :tag="tag"
            />
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
  background-color: #FAF6F0;
}

.link {
  display: inline-flex;
  margin-bottom: 0.4rem;
}

.description {
  font-size: 0.8rem;
  font-weight: 300;
  color: var(--muted);
}
</style>
