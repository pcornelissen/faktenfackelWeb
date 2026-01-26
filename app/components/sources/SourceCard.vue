<script setup lang="ts">
import { capitalize } from '~/utils/stringUtils'

import type { Source } from '~/utils/referenceData'

const props = defineProps<{
  source: Source
}>()
</script>

<template>
  <UCard
    as="li"
    variant="soft"
    style="width: 18rem"
    class="mx-4 my-4 cursor-pointer"
    @click="navigateTo(source.path)"
  >
    <template #header>
      <NuxtLink
        :to="source.path"
        class="link"
      >
        {{ source.name }}

        <div
          v-if="source.description"
          class="description mb-2"
        >
          {{ source.description }}
        </div>
      </NuxtLink>
    </template>
    <lazy-nuxt-img
      v-if="source.image"
      :src="source.image"
      class="source-img rounded-2xl"
    />
    <template #footer>
      <div class="flex flex-wrap">
        <!-- suppress HtmlUnknownTarget -->
        <NuxtLink
          v-for="tag in source.tags"
          :key="tag"
          :to="`/quellen/tags/${tag}`"
          class="tag"
        >
          {{ capitalize(tag) }}
        </NuxtLink>
      </div>
    </template>
  </UCard>
</template>

<style scoped>
li {
  background-color: #f2f2f2;
  transition: ease all .5s;
}

li:hover {
  background-color: #fde2cc;
  transition: ease all .5s;
}

.link {
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
