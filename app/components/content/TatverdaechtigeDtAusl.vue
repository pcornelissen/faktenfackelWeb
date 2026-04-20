<script setup lang="ts">
const labels = ['Unter 14', '14-17', '18-20', '21-29', '30-39', '40-49', '50-59', '60+']
const series = [
  { label: 'Deutsche', values: [61214, 114910, 81115, 204966, 238403, 207277, 155525, 167022], color: 'var(--flame)' },
  { label: 'Ausländer', values: [27436, 50172, 46188, 164221, 177068, 124072, 61703, 27091], color: 'var(--ember)' },
]
</script>

<template>
  <AltersgruppenBalken
    title="Tatverdächtige nach Altersgruppe und Herkunft (absolut)"
    subtitle="Deutsche und nicht-deutsche Tatverdächtige (ohne ausländerrechtliche Verstöße), PKS 2025. Quelle: BKA."
    :labels="labels"
    :series="series"
  />
</template>
