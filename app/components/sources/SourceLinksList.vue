<script setup lang="ts">
import type { SourceLink } from '~/utils/contentUtils'
import SourceLinkItem from '~/components/sources/SourceLinkItem.vue'

const props = defineProps<{
  list: SourceLink[]
  basePath: string
}>()
</script>

<template>
  <nav class="navigation">
    <h2 class="text-2xl font-bold mt-12 mb-5">
      Links
    </h2>
    <ul>
      <li
        v-for="item in props.list"
        :key="item.path"
        class="flex flex-row"
      >
        <SourceLinkItem
          :item="item"
          :hide-details="false"
        />
      </li>
    </ul>
  </nav>
</template>

<style scoped>
li {
  list-style: none;
  margin-bottom: 1rem;
}
</style>
