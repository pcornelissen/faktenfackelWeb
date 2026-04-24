<script setup lang="ts">
import TagFilteredPager from '~/components/content/TagFilteredPager.vue'
import Tag from '~/components/sources/Tag.vue'
import VerdictLabel from '~/components/VerdictLabel.vue'
import { nodeToPost } from '~/utils/graphData'
import type { Post } from '~/utils/contentUtils'

const props = defineProps<{
  tags: string[] | string
  sort?: 'date_desc' | 'date_asc'
  limit?: number
  instanceKey?: string
}>()

const tagList = computed(() =>
  (Array.isArray(props.tags)
    ? props.tags
    : typeof props.tags === 'string' ? JSON.parse(props.tags) as string[] : [])
    .map(t => String(t)).filter(Boolean),
)

const { items, page, totalPages, pageParam, isEmpty, pending } = useTagFilteredNodes({
  type: 'article',
  group: 'faktenchecks',
  tags: () => tagList.value,
  sort: props.sort,
  limit: props.limit,
  instanceKey: props.instanceKey,
})

const posts = computed<Post[]>(() =>
  items.value.map(n => nodeToPost(n) as unknown as Post),
)
</script>

<template>
  <div class="tf-wrap">
    <div
      v-if="pending && !posts.length"
      class="tf-loading"
    >
      Lade Einträge …
    </div>
    <p
      v-else-if="isEmpty"
      class="tf-empty"
    >
      Noch keine Einträge zu diesem Thema.
    </p>
    <ul
      v-else
      class="tf-list"
    >
      <li
        v-for="item in posts"
        :key="item.path"
        class="tf-item"
      >
        <NuxtLink
          :to="item.path"
          class="tf-link"
        >
          <span class="tf-title">{{ item.title }}</span>
          <VerdictLabel
            v-if="item.verdict"
            :type="item.verdict"
          />
        </NuxtLink>
        <p
          v-if="item.subtitle"
          class="tf-sub"
        >
          {{ item.subtitle }}
        </p>
        <div
          v-if="item.tags?.length"
          class="tf-tags"
        >
          <Tag
            v-for="t in item.tags"
            :key="t"
            :tag="t"
          />
        </div>
      </li>
    </ul>
    <TagFilteredPager
      :page="page"
      :total-pages="totalPages"
      :query-key="pageParam"
    />
  </div>
</template>

<style scoped>
.tf-wrap {
  margin: 1.25rem 0;
}
.tf-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}
.tf-item {
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--fackel-border);
}
.tf-item:last-child {
  border-bottom: none;
}
.tf-link {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 700;
  color: var(--ink);
  text-decoration: none;
}
.tf-link:hover .tf-title {
  color: var(--flame);
}
.tf-sub {
  color: var(--muted);
  margin: 0.3rem 0 0.4rem;
  font-size: 0.95rem;
}
.tf-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}
.tf-empty,
.tf-loading {
  color: var(--muted);
  font-style: italic;
  padding: 0.75rem 0;
}
</style>
