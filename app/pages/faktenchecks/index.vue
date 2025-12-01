<script setup lang="ts">
import SectionsOverview from '~/components/overview/SectionsOverview.vue'
import Heading from '~/components/layout/Heading.vue'
import { definePageData } from '~/utils/contentUtils'

await definePageData({
  title: 'Faktenchecks - Faktenfackel',
  pageHeading: 'Faktenfackel - Faktenchecks',
  pageSubHeading: 'Themenbereiche',
})
</script>

<template>
  <div>
    <Heading
      class="mt-8"
      title="Faktenchecks"
      icon="fake-news"
      icon-txt="Freepik Icon von Scherz Infinite Dendrogram"
    />
    <SectionsOverview />
  </div>
</template>
