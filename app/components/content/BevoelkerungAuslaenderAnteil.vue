<script setup lang="ts">
const labels = ['Unter 14', '14-17', '18-20', '21-29', '30-39', '40-49', '50-59', '60+']
// Ausländeranteil an Gesamtbevölkerung je Altersgruppe (%)
const series = [
  { label: 'Ausländeranteil an der Altersgruppe', values: [15.3, 15.0, 17.3, 23.7, 23.3, 20.2, 13.3, 6.3], color: 'var(--ember)' },
]
</script>

<template>
  <AltersgruppenBalken
    title="Ausländeranteil in der Bevölkerung je Altersgruppe"
    subtitle="Prozentualer Anteil ausländischer Einwohner an der jeweiligen Altersgruppe. Stichtag 31.12.2024. Quelle: Destatis."
    :labels="labels"
    :series="series"
    unit="%"
    :max-value="25"
  />
</template>
