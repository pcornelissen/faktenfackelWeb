<script setup lang="ts">
const labels = ['Unter 14', '14-17', '18-20', '21-29', '30-39', '40-49', '50-59', '60+']
const series = [
  { label: 'Deutsche', values: [9182761, 2664400, 2029012, 6492367, 8367031, 8310066, 10262406, 23876822], color: 'var(--flame)' },
  { label: 'Ausländer', values: [1658104, 469777, 425204, 2011458, 2547063, 2101551, 1571973, 1607145], color: 'var(--ember)' },
]
</script>

<template>
  <AltersgruppenBalken
    title="Altersstruktur der Bevölkerung (absolut)"
    subtitle="Deutsche und ausländische Einwohner nach Altersgruppen, Stichtag 31.12.2024. Quelle: Destatis."
    :labels="labels"
    :series="series"
  />
</template>
