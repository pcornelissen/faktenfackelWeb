<script setup lang="ts">
const route = useRoute()

const category = (route.params.category as string)
const slug = (route.params.slug as string[]).join('/')

const categoryPath = `/faktenchecks/${category}`;
const basePath = route.path;// ``/faktenchecks/${category}/${slug}`;

const {data: post}
  = await
  useAsyncData(
    `faktencheck-${slug}`,
    () => {
      return queryCollection('faktenchecks').path(basePath).first()
    })

useSeoMeta({
  title: post.value?.title,
  description: post.value?.description
})
</script>

<template>
  <NuxtLink :to="categoryPath">
    Zurück zum Bereich {{ capitalize(category) }}
  </NuxtLink>
  <div>
    <ContentRenderer
      v-if="post"
      :value="post"
    />
    <div v-else>
      Diese Seite existiert nicht!
    </div>
  </div>
</template>

