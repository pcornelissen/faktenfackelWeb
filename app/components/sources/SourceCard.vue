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
  <li class="source-card">
    <div class="card-img-wrap">
      <img
        :src="calculateSourceImg(source)"
        :alt="source.name"
        :title="calculateSourceImgAuthor(source)"
        loading="lazy"
        width="200"
        height="60"
        class="card-img"
        @error="(e) => ((e.target as HTMLImageElement).src = '/default-profile.webp')"
      >
    </div>
    <div class="card-body">
      <NuxtLink
        :to="source.path"
        class="card-name"
      >
        {{ source.name }}
      </NuxtLink>
      <p
        v-if="source.description"
        class="card-desc"
      >
        {{ source.description }}
      </p>
    </div>
    <div
      v-if="source.tags?.length"
      class="card-footer"
    >
      <Tag
        v-for="tag in source.tags"
        :key="tag"
        :tag="tag"
      />
    </div>
  </li>
</template>

<style scoped>
.source-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  background: white;
  border: 1px solid var(--fackel-border);
  border-radius: 1.1rem;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
  list-style: none;
  box-shadow: 0 10px 24px rgba(31, 22, 15, 0.04);
}

.source-card:hover {
  border-color: #E6C6A7;
  box-shadow: 0 16px 34px rgba(31, 22, 15, 0.08);
  transform: translateY(-2px);
}

.card-img-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 96px;
  background: #FDFAF6;
  border-bottom: 1px solid var(--fackel-border);
  padding: 0.75rem 1.25rem;
}

.card-img {
  max-height: 60px;
  max-width: 100%;
  object-fit: contain;
  border-radius: 4px;
}

.card-body {
  padding: 1rem 1.05rem 0.75rem;
  flex: 1;
}

.card-name {
  display: block;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.18rem;
  font-weight: 700;
  color: var(--ink);
  text-decoration: none;
  line-height: 1.14;
  margin-bottom: 0.45rem;
  transition: color 0.15s;
}

.source-card:hover .card-name {
  color: var(--flame);
}

.card-desc {
  font-size: 0.92rem;
  color: var(--muted);
  line-height: 1.52;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  padding: 0.6rem 0.85rem 0.8rem;
  border-top: 1px solid var(--fackel-border);
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem;
}
</style>
