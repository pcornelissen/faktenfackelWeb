<script setup lang="ts">
import SectionsItem from '~/components/overview/SectionsItem.vue'
import Sections from '~/components/overview/Sections.vue'
import { useSlots } from 'vue'

const slots = useSlots()
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
        title="Blog"
        subtitle="Zu Faktenfackel und allgemeinen Themen"
        href="/lagerfeuer/blog"
        icon="blogging"
        icon-txt="flaticon.com von Rlkas Dzihab"
      >
        <p>Blog Beiträge, hauptsächlich zu Faktenfackel selber.</p>
      </SectionsItem>
      <SectionsItem
        title="Perspektiven"
        subtitle="Unsere Perspektive auf Themen"
        href="/lagerfeuer/perspektiven"
        icon="feedback"
        icon-txt="Freepik Icon von Good Ware"
      >
        <p>Persönliche Beiträge zu Themen</p>
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
