<script setup lang="ts">
import Heading from '~/components/layout/Heading.vue'
import { definePageData } from '~/utils/contentUtils'
import CategoriesOverview from '~/components/lagerfeuer/CategoriesOverview.vue'

await definePageData({
  title: 'Lagerfeuer - Faktenfackel',
  pageHeading: 'Fakte^nfackel - Lagerfeuer',
  pageSubHeading: 'Ausarbeitungen, Meinung, Blog',
})
</script>

<template>
  <div>
    <Heading

      title="Lagerfeuer"
      icon="bonfire"
      icon-txt="Freepik Icon von @smashingstocks"
    />
    <div class="introduction">
      <p>
        Lagerfeuer sind die gemütlichen, lange brennenden Möglichkeiten der Zusammenkunft, bei denen wir uns austauschen
        können.
      </p>
      <p>
        Daher ist dies ist der Bereich, in dem wir <strong>dedizierte Ausarbeitungen</strong> von interessanten
        Themen veröffentlichen, die nicht unbedingt in die anderen Kategorien passen. <br>
        Hier teilen wir unsere <strong>Meinungen, Gedanken und Analysen</strong> zu
        verschiedenen Aspekten der Gesellschaft und darüber hinaus. Es ist ein Ort für tiefere
        Einblicke, <strong>persönliche Perspektiven</strong> und kreative Ideen, die über die üblichen Faktenchecks und
        Quellen Inhalte
        hinausgehen.
      </p>
      <p>
        Um nicht noch einen Bereich aufzumachen, werden hier hier auch gelegentlich als Blog <strong>Themen zur
          Faktenfackel an sich</strong> veröffentlichen.
      </p>
    </div>
    <div>
      <h2>Kategorien</h2>
      <CategoriesOverview />
    </div>
  </div>
</template>

<style scoped>

</style>
