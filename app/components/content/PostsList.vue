<script setup lang="ts">
import {Icon} from "@iconify/vue";
import {capitalize} from "~/utils/stringUtils";

const props = defineProps<{
  list: any[]
  basePath: string
  href?: string
}>()

</script>

<template>
  <nav class="navigation">
    <ul>
      <li v-for="item in props.list" :key="item.path" class="flex flex-row">
        <Icon icon="mdi:faq" :ssr="true" height="32" />
        <div class="flex flex-row">
          <div class="flex-auto ml-2">
            <NuxtLink :to="item.path" class="link">
              {{ item.title }}
            </NuxtLink>

            <NuxtLink v-for="tag in item.meta.tags" :key="tag" :to="`${props.basePath}/tags/${tag}`" class="tag">
              {{ capitalize(tag) }}
            </NuxtLink>
            <br/>
            <span class="lastChange">Stand {{ new Date(item.meta['last-change']).toLocaleDateString() }}</span>
          </div>
        </div>
      </li>
    </ul>
  </nav>
</template>

<style scoped>

li {
  font-size: 1rem;
  margin-bottom: 1rem;
  list-style: none;
  border-radius: 0.3rem;
  padding: 0.5rem;
}

li:hover {
  background-color: #eee;
}

.link {
  display: block;
  margin-bottom: 0.4rem;
}

.lastChange {
  font-size: 0.6rem;
  font-weight: 200;
}

.tag {
  font-size: 0.8rem;
  font-weight: 200;
  background-color: #aaa;
  color: #fff;
  padding: 0.2rem 0.4rem;
  margin: 0.2rem 0.4rem;
  border-radius: 0.2rem;
}
</style>
