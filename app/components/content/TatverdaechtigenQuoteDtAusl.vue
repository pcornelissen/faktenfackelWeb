<script setup lang="ts">
const labels = ['Unter 14', '14-17', '18-20', '21-29', '30-39', '40-49', '50-59', '60+']
// TV-Quote bezogen auf die eigene Gruppe (%)
const series = [
  { label: 'Deutsche', values: [0.67, 4.31, 4.00, 3.16, 2.85, 2.49, 1.52, 0.70], color: 'var(--flame)' },
  { label: 'Ausländer', values: [1.65, 10.68, 10.86, 8.16, 6.95, 5.90, 3.93, 1.69], color: 'var(--ember)' },
]
</script>

<template>
  <AltersgruppenBalken
    title="Tatverdächtigen-Quote innerhalb der eigenen Gruppe"
    subtitle="Anteil der Tatverdächtigen an der jeweiligen Bevölkerungsgruppe (%). Deutsche und Ausländer je Altersgruppe, PKS 2025. Quelle: BKA + Destatis (Stichtag 31.12.2024)."
    :labels="labels"
    :series="series"
    unit="%"
    :max-value="12"
  />
</template>
