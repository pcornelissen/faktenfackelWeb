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
      icon-txt="<a href=&quot;https://www.flaticon.com/de/kostenlose-icons/abstimmung&quot; title=&quot;Freepik Icon von abstimmung&quot;>Abstimmung<br/>Freepik</a>"
    >
      <p>Allgemeine Faktenchecks zu politischen Themen.</p>
    </SectionsItem>
    <SectionsItem
      title="Gesellschaft"
      sub-title="Faktenchecks"
      href="/faktenchecks/gesellschaft"
      icon="population"
      icon-txt="<a href=&quot;https://www.flaticon.com/de/kostenlose-icons/population&quot; title=&quot;Freepik Icon von population&quot;>population<br/>Freepik</a>"
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
