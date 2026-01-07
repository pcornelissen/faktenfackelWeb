<script setup lang="ts">
import { capitalize } from '~/utils/stringUtils'
import type { SourceLink } from '~/utils/contentUtils'
import SourceLinkIcon from '~/components/sources/SourceLinkIcon.vue'
import SourceLinkTags from '~/components/sources/SourceLinkTags.vue'

const props = defineProps<{
  item: SourceLink
  hideDetails: boolean
}>()
</script>

<template>
  <div
    v-if="props.item"
    class="flex-auto ml-2 row"
  >
    <div class="flex  ">
      <SourceLinkIcon
        :type="props.item.type"
      />
      <a
        :href="props.item.uri"
        rel="external"
        class="link  "
      >
        {{ props.item.title }}
      </a>
    </div>
    <SourceLinkTags :tags="props.item.tags">
      <template #end>
        <NuxtLink
          :to="props.item.path"
          class="details"
        >
          [Details]
        </NuxtLink>
      </template>
    </SourceLinkTags>
  </div>
</template>

<style scoped>
.row {
  font-size: 1rem;
  border-radius: 0.3rem;
  padding: 0.5rem;
}

.row:hover {
  background-color: #eee;
}

.link {
  display: block;
  margin-bottom: 0.4rem;
}

.details {
  padding: 0.2rem 0.4rem;
  border-radius: 0.2rem;
  font-size: 0.8rem;
  font-weight: 200;
}

.details:hover {
  background-color: var(--color-tertiary);
  color: #fff;
  transition: ease all .5s;

}
</style>
