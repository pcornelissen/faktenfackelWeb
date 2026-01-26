<script setup lang="ts">
import type { Source } from '~/utils/referenceData'
import SourceCard from '~/components/sources/SourceCard.vue'

const props = defineProps<{
  list: Source[]
}>()
</script>

<template>
  <nav class="navigation">
    <ul
      class="flex flex-wrap "
      style="max-width: 100%"
    >
      <source-card
        v-for="item in props.list"
        :key="item.path"
        :source="item"
      />
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
