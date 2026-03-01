<script setup lang="ts">
import type { Source } from '~/utils/referenceData'
import { calculateSourceImg, calculateSourceImgAuthor } from '~/pages/quellen/[group]/sources'
import Tag from '~/components/sources/Tag.vue'

const props = defineProps<{
  source: Source
}>()
const source = props.source
</script>

<template>
  <UCard
    as="li"
    variant="soft"
    class="mx-2 my-2 cursor-pointer"
    style="width: clamp(16rem, 22%, 22rem)"
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
      :src="calculateSourceImg(source)"
      :alt="calculateSourceImgAuthor(source)"
      :title="calculateSourceImgAuthor(source)"
      placeholder="/files/no-img.svg"
      placeholder-class="placeholder-img rounded-lg p-2"
      class="source-img rounded-lg"
    />
    <template #footer>
      <div class="flex flex-wrap">
        <Tag
          v-for="tag in source.tags"
          :key="tag"
          :tag="tag"
          base-path="/quellen"
        />
      </div>
    </template>
  </UCard>
</template>

<style scoped>
li {
  background-color: white;
  border: 1px solid var(--fackel-border);
  transition: border-color 0.15s, box-shadow 0.15s;
  img {
    background-color: #f9f9f9;
    min-width: 3em;
    min-height: 3em;
    margin: 0 auto;
  }
}

li:hover {
  border-color: var(--ember);
  box-shadow: 0 2px 8px rgba(232, 68, 10, 0.1);
}

.link {
}

.description {
  font-size: 0.8rem;
  font-weight: 200;
  color: #999;
}
</style>
