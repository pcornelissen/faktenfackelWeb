<script setup lang="ts">
import {capitalize} from "~/utils/stringUtils";
import PostsList from "~/components/content/PostsList.vue";
import {filter} from "~/utils/contentUtils";

const route = useRoute();

const category = route.params.category as string;
const basePath = route.path;// `/faktencheck/${category}`;

const {data: categoryInfo}
  = await
  useAsyncData(
    `faktencheck-${category}-info`,
    () => {
      return queryCollection('faktenchecks').path(`${basePath}/_info`).first()
    })


const {data: post}
  = await
  useAsyncData(
    `faktencheck-${category}`,
    () => {
      return queryCollection('faktenchecks').path(`${basePath}`).first()
    });


const title = `Faktenchecks im Bereich ${capitalize(category)}`;

useSeoMeta({
  title: post.value?.title || title,
  description: post.value?.description
})

const {data: list} = await useAsyncData(route.path, () => {
  return queryCollection('faktenchecks')
    .select("title", "path", "meta")
    .all()
});

</script>

<template>
  <div v-if="list">
    <h1>{{ title }}</h1>
    <ContentRenderer
      v-if="categoryInfo"
      :value="categoryInfo"
      class="intro"
    />
    <PostsList :list="filter(list, category)" :base-path="route.path"/>
  </div>
  <div v-else>
    Diese Seite existiert nicht!<br/>
    <br/>
    <NuxtLink :to="`/faktenchecks/`">
      Zurück zur Übersicht }}
    </NuxtLink>
  </div>
<!--  <debug :content=route></debug>-->
</template>
<style scoped>


.intro {
  margin-bottom: 2rem;
  padding: 0.5rem;
  border-radius: 0.3rem;
  background-color: #eee;
}

</style>
