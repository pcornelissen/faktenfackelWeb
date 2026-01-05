<script setup lang="ts">
const { data: list1 } = await useAsyncData('/faktenchecks', () => {
  return queryCollection('faktenchecks')
    .select('title', 'subtitle', 'path', 'published', 'tags', 'date')
    .order('date', 'DESC')
    .all()
})
const list = list1.value as Post[]

function filter(list: Post[]) {
  return list.filter(post => !post.path.endsWith('/_info')).slice(0, 5)
}
</script>

<template>
  <ul>
    <li
      v-for="item in filter(list)"
      :key="item.path"
    >
      <div class="date">
        {{ new Date(item.date).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }) }} -
      </div>
      <div class="desc">
        <NuxtLink
          :to="item.path"
          class="link"
        > {{ item.title }}
        </NuxtLink>
      </div>
    </li>
  </ul>
</template>

<style scoped>
ul {
  display: block;

  list-style-type: none;
}

li {
  display: flex;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.date {
  text-wrap: nowrap;
}

.desc {
  text-wrap: balance;
  font-style: italic;
}
</style>
