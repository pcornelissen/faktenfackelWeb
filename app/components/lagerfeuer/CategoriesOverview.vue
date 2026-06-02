<script setup lang="ts">
import SectionsItem from '~/components/overview/SectionsItem.vue'
import Sections from '~/components/overview/Sections.vue'
import { useSlots } from 'vue'

interface CategoryItem {
  path: string
  title: string
  subtitle?: string
  description?: string
  icon?: string
  iconTxt?: string
}

const slots = useSlots()

const { data: categories } = await useFetch<CategoryItem[]>('/api/content/list', {
  key: 'lagerfeuer-categories',
  query: {
    collection: 'lagerfeuer',
    scope: 'infos',
    value: '/lagerfeuer',
    fields: 'title,subtitle,description,path,icon,iconTxt',
  },
})
</script>

<template>
  <div>
    <Sections v-if="slots.start">
      <template #start>
        <slot name="start" />
      </template>
    </Sections>
    <Sections>
      <SectionsItem
        v-for="cat in categories"
        :key="cat.path"
        :title="cat.title"
        :subtitle="cat.subtitle ?? ''"
        :href="cat.path.replace('/_info', '')"
        :icon="cat.icon ?? 'blogging'"
        :icon-txt="cat.iconTxt ?? ''"
      >
        <p v-if="cat.description">
          {{ cat.description }}
        </p>
      </SectionsItem>
    </Sections>
    <sections v-if="slots.end">
      <template #end>
        <slot name="end" />
      </template>
    </sections>
  </div>
</template>

<style scoped>
</style>
