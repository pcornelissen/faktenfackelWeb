<script setup lang="ts">
import SectionsItem from '~/components/overview/SectionsItem.vue'
import Sections from '~/components/overview/Sections.vue'
</script>

<template>
  <Sections>
    <template #start>
      <slot name="start" />
    </template>
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
    <template #end>
      <slot name="end" />
    </template>
  </sections>
</template>

<style scoped>
</style>
