<script setup lang="ts">
import SectionsItem from '~/components/overview/SectionsItem.vue'
</script>

<template>
  <div class="container">
    <slot name="start" />
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
    <slot name="end" />
  </div>
</template>

<style scoped>
    .container {
        display: flex;
        justify-content: flex-start;
        flex-direction: row;
        align-items: center;
        flex-wrap: wrap;
    }
</style>
