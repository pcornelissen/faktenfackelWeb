<script setup lang="ts">
import { newsSrc } from '~/news/newsSrc'

const props = defineProps<{
  limit?: number
}>()

function limitNews() {
  return props.limit
    ? newsSrc
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, props.limit)
    : newsSrc
}
</script>

<template>
  <ul>
    <li
      v-for="item in limitNews()"
      :key="item.title"
    >
      <div class="date">
        {{ item.date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }) }} -
      </div>
      <div class="desc">
        {{ item.title }}
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
