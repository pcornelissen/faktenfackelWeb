<script setup lang="ts">
import { nowIso } from '~/utils/contentUtils'

const { data: list1 } = await useAsyncData('/faktenchecks', () => {
  return queryCollection('faktenchecks')
    .select('title', 'subtitle', 'path', 'publishedOn', 'tags', 'date', 'verdict')
    .where('publishedOn', '<=', nowIso())
    .order('date', 'DESC')
    .all()
})
const list = list1.value as Post[]

function filter(list: Post[]) {
  return list.filter(post => !post.path.endsWith('/_info')).slice(0, 6)
}
</script>

<template>
  <ul class="recent-posts">
    <li
      v-for="(item, index) in filter(list)"
      :key="item.path"
      class="post-item"
    >
      <span class="post-num">{{ String(index + 1).padStart(2, '0') }}</span>
      <div class="post-body">
        <div class="post-meta">
          <span
            v-if="item.tags?.[0]"
            class="post-tag"
          >{{ item.tags[0] }}</span>
          <span
            v-if="item.tags?.[0]"
            class="post-dot"
          >·</span>
          <span class="post-date">{{ dateString(item.date) }}</span>
        </div>
        <NuxtLink
          :to="item.path"
          class="post-title"
        >
          {{ item.title }}
        </NuxtLink>
        <p
          v-if="item.subtitle"
          class="post-subtitle"
        >
          {{ item.subtitle }}
        </p>
      </div>
      <VerdictLabel
        v-if="item.verdict !== undefined"
        :type="item.verdict"
        class="post-verdict"
      />
      <div
        v-else
        class="post-verdict-placeholder"
      />
    </li>
  </ul>
</template>

<style scoped>
.recent-posts {
  list-style: none;
  padding: 0;
  margin: 0;
}

.post-item {
  display: grid;
  grid-template-columns: 36px 1fr auto;
  gap: 1rem;
  align-items: start;
  padding: 1.25rem 1.35rem;
  border: 1px solid var(--fackel-border);
  border-radius: 1.1rem;
  background: white;
  box-shadow: 0 10px 24px rgba(31, 22, 15, 0.04);
  margin-bottom: 0.9rem;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
}

.post-item:hover {
  transform: translateY(-2px);
  border-color: #E6C6A7;
  box-shadow: 0 16px 34px rgba(31, 22, 15, 0.08);
}

.post-num {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.72rem;
  color: #8C8078;
  padding-top: 0.25rem;
  letter-spacing: 0.08em;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.post-tag {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--flame);
  font-weight: 600;
}

.post-dot {
  color: #A09890;
  font-size: 0.8rem;
}

.post-date {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.72rem;
  color: var(--muted);
}

.post-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(1.35rem, 2vw, 1.75rem);
  font-weight: 700;
  line-height: 1.08;
  color: var(--ink);
  text-decoration: none;
  display: block;
  transition: color 0.15s;
}

.post-title:hover {
  color: var(--flame);
}

.post-subtitle {
  font-size: 1rem;
  color: #5C5550;
  line-height: 1.55;
  margin: 0.45rem 0 0;
  font-weight: 400;
}

.post-verdict-placeholder {
  width: 0;
}

@media screen and (max-width: 560px) {
  .post-item {
    grid-template-columns: 1fr auto;
    padding: 1rem;
  }
  .post-num { display: none; }
  .post-title {
    font-size: 1.25rem;
  }
  .post-subtitle {
    font-size: 0.95rem;
  }
}
</style>
