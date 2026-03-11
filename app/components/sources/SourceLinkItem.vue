<script setup lang="ts">
import SourceLinkIcon from '~/components/sources/SourceLinkIcon.vue'
import Tags from '~/components/sources/Tags.vue'
import type { SourceLink } from '~/utils/referenceData'

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
    <div class="title-row">
      <SourceLinkIcon
        :type="props.item.type"
      />
      <NuxtLink
        :to="props.item.path"
        class="link"
      >
        {{ props.item.title }}
      </NuxtLink>
      <a
        :href="props.item.uri"
        rel="external noopener"
        target="_blank"
        class="external"
        :title="'Direkt zu: ' + props.item.uri"
      >
        <UIcon
          name="mdi:open-in-new"
          class="size-4"
        />
      </a>
    </div>
    <Tags
      :tags="props.item.tags"
      class="ml-5"
    />
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

.title-row {
  display: flex;
  align-items: flex-start;
  gap: 0.25rem;
  margin-bottom: 0.4rem;
}

.link {
  flex: 1;
  min-width: 0;
}

.external {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  min-width: 2rem;
  min-height: 2rem;
  color: var(--flame);
  border-radius: 0.2rem;
  text-decoration: none;
  transition: color 0.15s, background 0.15s;
}

.external:hover {
  color: var(--ember);
  background-color: var(--fackel-border);
}
</style>
