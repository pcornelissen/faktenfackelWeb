<script setup lang="ts">
import { calculateSourceImg, calculateSourceImgAuthor } from '~/pages/quellen/[group]/sources'

const props = defineProps<{
  source: Source | null | undefined
}>()

const imgFailed = ref(false)

function onImgError() {
  imgFailed.value = true
}
</script>

<template>
  <NuxtLink
    v-if="props.source"
    :to="props.source.path"
    class="source-info"
  >
    <img
      v-if="!imgFailed"
      :src="calculateSourceImg(props.source)"
      :alt="props.source.name"
      :title="calculateSourceImgAuthor(props.source)"
      class="source-img"
      @error="onImgError"
    >
    <div
      v-else
      class="source-img-placeholder"
      :title="calculateSourceImgAuthor(props.source)"
    >
      <UIcon
        name="mdi:account-circle"
        class="size-10"
      />
    </div>
    <span class="source-name">{{ props.source.name }}</span>
  </NuxtLink>
</template>

<style scoped>
.source-info {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 120px;
  flex-shrink: 0;
  text-decoration: none;
  padding: 0.6rem;
  border: 1px solid var(--fackel-border);
  border-radius: 4px;
  background: white;
  transition: border-color 0.15s;
}

.source-info:hover {
  border-color: var(--flame);
}

.source-img {
  max-width: 100px;
  max-height: 60px;
  object-fit: contain;
  border-radius: 4px;
}

.source-name {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.72rem;
  color: var(--muted);
  text-align: center;
  line-height: 1.3;
  word-break: break-word;
}

.source-img-placeholder {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fackel-border);
}
</style>
