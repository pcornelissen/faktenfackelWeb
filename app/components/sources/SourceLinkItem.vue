<script setup lang="ts">
import SourceLinkIcon from '~/components/sources/SourceLinkIcon.vue'
import Tags from '~/components/sources/Tags.vue'
import type { SourceLink } from '~/utils/referenceData'
import { Icon } from '@iconify/vue'

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
        style="max-width: 30rem"
      >
        {{ props.item.title }}
      </a>
    </div>
    <Tags
      :tags="props.item.tags"
      class="ml-5"
      base-path="/quellen"
    >
      <template #end>
        <NuxtLink
          :to="props.item.path"
          class="details"
        >
          <Icon
            icon="mdi:more"
            :ssr="true"
            height="16"
            class="inline"
            style="margin-top: -2px"
          />&nbsp;
          Details
        </NuxtLink>
      </template>
    </Tags>
  </div>
</template>

<style scoped>
.row {
  font-size: 1rem;
  border-radius: 0.3rem;
  padding: 0.5rem;
}

.row:hover {
  background-color: #FAF6F0;
}

.link {
  display: block;
  margin-bottom: 0.4rem;
}

.details {
  padding: 0.2rem 0.6rem;
  border-radius: 0.2rem;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: var(--flame);
  color: white;
  border: 1px solid var(--flame);
  text-decoration: none;
  transition: background 0.15s, transform 0.1s;
}

.details:hover {
  background-color: #C73408;
  border-color: #C73408;
  color: white;
  transform: translateY(-1px);
}
</style>
