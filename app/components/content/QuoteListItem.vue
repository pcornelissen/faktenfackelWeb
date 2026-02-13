<script setup lang="ts">
import type { Quote } from '~/utils/contentUtils'
import Tags from '~/components/sources/Tags.vue'

const props = defineProps<{
  quote: Quote
}>()
</script>

<template>
  <li
    class="flex flex-row"
  >
    <slot name="pre" />
    <div class="flex-auto ml-2">
      <NuxtLink
        :to="props.quote.path"
        class="link"
      >
        <div class="title">
          {{ props.quote.title }}
        </div>
        <div class="teaser">
          {{ props.quote.teaser }}
        </div>
        <slot />
      </NuxtLink>
      <Tags
        :tags="props.quote.tags"
        base-path="/zitate"
      />
      <slot name="post" />
    </div>
  </li>
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

.title {
  font-size: 0.8rem;
  font-weight: 200;
  color: gray;
  padding-bottom: 0.4rem;
}
.teaser {
  font-weight: 200;
  padding-bottom: 0.4rem;
}
</style>
