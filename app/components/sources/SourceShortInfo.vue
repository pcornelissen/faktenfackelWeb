<script setup lang="ts">
import { calculateSourceImg, calculateSourceImgAuthor } from '~/pages/quellen/[group]/sources'

const props = defineProps<{
  source: Source | null
}>()
</script>

<template>
  <nuxt-link
    v-if="props.source"
    class="flex mr-2 flex-col block source"
    style="width: 100px"
    :to="props.source.path"
  >
    <lazy-nuxt-img
      :src="calculateSourceImg(props.source)"
      :alt="calculateSourceImgAuthor(props.source)"
      :title="calculateSourceImgAuthor(props.source)"
      placeholder="/files/no-img.svg"
      placeholder-class="placeholder-img rounded-lg p-2"
      class="source-img rounded-lg"
      width="100"
      height="100"
      fit="cover"
      style="margin-top: 4px"
    />
    <div class="text-sm text-gray-400">
      {{ props.source.name }}
    </div>
  </nuxt-link>
</template>

<style scoped>
.source-img {
  max-width: 15rem;
  max-height: 5rem;
  display: inline;
}
.source{
  transition: ease all .5s;
}
.source:hover {
  transform: scale(1.05);
  transition: ease all .5s;
}
</style>
