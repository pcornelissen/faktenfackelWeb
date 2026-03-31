<script setup lang="ts">
import SourceLinkItem from '~/components/sources/SourceLinkItem.vue'
import type { SourceLink } from '~/utils/referenceData'

const props = defineProps<{
  list: SourceLink[]
  titleOverride?: string
}>()
</script>

<template>
  <nav class="navigation">
    <h2 class="section-title">
      {{ titleOverride?titleOverride:'Links' }}
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
.section-title {
  margin: 2.4rem 0 1rem;
  line-height: 0.98;
  letter-spacing: -0.03em;
  text-wrap: balance;
}

li {
  list-style: none;
  margin-bottom: 1rem;
}

@media screen and (max-width: 560px) {
  .section-title {
    margin: 1.9rem 0 0.8rem;
  }

  li {
    margin-bottom: 0.85rem;
  }
}
</style>
