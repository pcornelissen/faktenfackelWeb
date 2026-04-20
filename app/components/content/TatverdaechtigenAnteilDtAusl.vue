<script setup lang="ts">
const labels = ['Unter 14', '14-17', '18-20', '21-29', '30-39', '40-49', '50-59', '60+']
// Anteil Dt/Ausl an allen Tatverdächtigen je Altersgruppe (%)
const series = [
  { label: 'Deutsche', values: [69.1, 68.7, 61.8, 52.8, 55.1, 61.1, 70.4, 85.8], color: 'var(--flame)' },
  { label: 'Ausländer', values: [30.9, 30.4, 36.3, 44.5, 42.6, 37.4, 28.4, 14.0], color: 'var(--ember)' },
]
</script>

<template>
  <AltersgruppenBalken
    title="Verteilung der Tatverdächtigen auf Deutsche und Ausländer je Altersgruppe"
    subtitle="Anteil an allen Tatverdächtigen einer Altersgruppe, PKS 2025 (ohne ausländerrechtliche Verstöße). Quelle: BKA."
    :labels="labels"
    :series="series"
    unit="%"
    :max-value="100"
  />
</template>
