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
        class="card-img"
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
  width: clamp(14rem, 22%, 22rem);
  margin: 0.5rem;
  background: white;
  border: 1px solid var(--fackel-border);
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
  list-style: none;
}

.source-card:hover {
  border-color: var(--flame);
  box-shadow: 0 3px 10px rgba(249, 140, 53, 0.12);
  transform: translateY(-1px);
}

.card-img-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88px;
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
  padding: 0.85rem 1rem 0.6rem;
  flex: 1;
}

.card-name {
  display: block;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1rem;
  font-weight: 700;
  color: var(--ink);
  text-decoration: none;
  line-height: 1.3;
  margin-bottom: 0.3rem;
  transition: color 0.15s;
}

.source-card:hover .card-name {
  color: var(--flame);
}

.card-desc {
  font-size: 0.8rem;
  color: var(--muted);
  line-height: 1.45;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  padding: 0.5rem 0.75rem 0.6rem;
  border-top: 1px solid var(--fackel-border);
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem;
}
</style>
