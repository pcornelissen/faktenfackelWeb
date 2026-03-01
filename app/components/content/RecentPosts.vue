<script setup lang="ts">
const { data: list1 } = await useAsyncData('/faktenchecks', () => {
  return queryCollection('faktenchecks')
    .select('title', 'subtitle', 'path', 'publishedOn', 'tags', 'date')
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
          <span v-if="item.tags?.[0]" class="post-tag">{{ item.tags[0] }}</span>
          <span v-if="item.tags?.[0]" class="post-dot">·</span>
          <span class="post-date">{{ dateString(item.date) }}</span>
        </div>
        <NuxtLink :to="item.path" class="post-title">
          {{ item.title }}
        </NuxtLink>
        <p v-if="item.subtitle" class="post-subtitle">{{ item.subtitle }}</p>
      </div>
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
  grid-template-columns: 28px 1fr;
  gap: 1rem;
  align-items: start;
  padding: 1.1rem 0;
  border-bottom: 1px solid var(--fackel-border);
  transition: background 0.1s;
}

.post-item:last-child {
  border-bottom: none;
}

.post-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.62rem;
  color: #C4BAB0;
  padding-top: 3px;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.post-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.post-dot {
  color: var(--fackel-border);
  font-size: 0.7rem;
}

.post-date {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  color: var(--muted);
}

.post-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.3;
  color: var(--ink);
  text-decoration: none;
  display: block;
  transition: color 0.15s;
}

.post-title:hover {
  color: var(--flame);
}

.post-subtitle {
  font-size: 0.82rem;
  color: var(--muted);
  line-height: 1.5;
  margin: 4px 0 0;
  font-weight: 300;
  font-style: italic;
}

@media screen and (max-width: 560px) {
  .post-item {
    grid-template-columns: 1fr;
    gap: 0.3rem;
  }
  .post-num { display: none; }
}
</style>
