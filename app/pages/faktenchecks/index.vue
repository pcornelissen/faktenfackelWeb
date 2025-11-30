<script setup lang="ts">
import SectionsOverview from '~/components/overview/SectionsOverview.vue'
import Heading from '~/components/layout/Heading.vue'
import { definePageData } from '~/utils/contentUtils'

definePageData({
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
      icon-txt="<a href=&quot;https://www.flaticon.com/de/kostenlose-icons/scherz&quot; title=&quot;Freepik Icon von Scherz Infinite Dendrogram&quot;>Scherz I.D.<br/>Freepik</a>"
    />
    <SectionsOverview />
  </div>
</template>
