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
        title="Politik"
        sub-title="Faktenchecks"
        href="/faktenchecks/politik"
        icon="politik"
        icon-txt="Freepik Icon von abstimmung"
      >
        <p>Allgemeine Faktenchecks zu politischen Themen.</p>
      </SectionsItem>
      <SectionsItem
        title="Gesellschaft"
        sub-title="Faktenchecks"
        href="/faktenchecks/gesellschaft"
        icon="population"
        icon-txt="Freepik Icon von population"
      >
        <p>Faktenchecks die die Gesellschaft und das Zusammenleben betreffen.</p>
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
