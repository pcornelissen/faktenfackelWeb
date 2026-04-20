<script setup lang="ts">
const labels = ['Unter 14', '14-17', '18-20', '21-29', '30-39', '40-49', '50-59', '60+']
const series = [
  { label: 'Männlich', values: [63306, 121824, 98127, 284313, 311834, 244869, 159143, 136532], color: 'var(--flame)' },
  { label: 'Weiblich', values: [25344, 43258, 29176, 84874, 103637, 86480, 58085, 57581], color: 'var(--ember)' },
]
</script>

<template>
  <AltersgruppenBalken
    title="Tatverdächtige nach Alter und Geschlecht (PKS 2025)"
    subtitle="Absolute Zahlen für Deutschland, Straftaten ohne Verstöße gegen das Aufenthalts-, Asyl- und Freizügigkeitsgesetz (Schlüssel 890000). Quelle: BKA PKS 2025."
    :labels="labels"
    :series="series"
  />
</template>
