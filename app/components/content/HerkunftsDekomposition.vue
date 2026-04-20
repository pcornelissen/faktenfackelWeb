<script setup lang="ts">
const steps = [
  {
    factor: 10.0,
    label: 'Dobrindts Grafik',
    desc: 'Rohe TVBZ männlicher afghanischer und syrischer Tatverdächtiger gegenüber männlichen Deutschen. Die "fast zehnfach" höhere Belastungszahl, die Dobrindt in der Pressekonferenz zeigt.',
    citation: 'Bundespressekonferenz PKS 2025, 20. April 2026',
  },
  {
    factor: 6.0,
    label: 'Ohne Kontrolldelikte',
    desc: 'Ausländerrechtliche Verstöße gehen überdurchschnittlich in die Zahlen bei Fluchtmigranten ein. Ohne diese Delikte fällt der Faktor deutlich.',
    citation: 'Analog zur Kontrolldelikt-Bereinigung in der PKS, Mediendienst Integration',
  },
  {
    factor: 3.5,
    label: 'Ohne Demografie',
    desc: 'Afghanische und syrische Geflüchtete sind zu über 80 % junge Männer. Diese demografische Gruppe hat unabhängig von Herkunft die höchste Kriminalitätsrate aller Bevölkerungsgruppen.',
    citation: 'Bundeszentrale für politische Bildung, Zensus + ifo-Studie 2025',
  },
  {
    factor: 2.0,
    label: 'Ohne soziale Lage',
    desc: 'Eingeschränkter Arbeitsmarktzugang, Leben in Gemeinschaftsunterkünften und Perspektivlosigkeit erhöhen Kriminalitätsraten in jeder Bevölkerungsgruppe. Vergleicht man mit deutschen Jugendlichen in vergleichbaren Lagen, schrumpft der Unterschied weiter.',
    citation: 'Kriminalsoziologische Forschung (Walburg 2023, Pfeiffer et al.)',
  },
  {
    factor: 1.3,
    label: 'Ohne Wohnort + Trauma',
    desc: 'Geflüchtete leben überwiegend in urbanen Räumen mit strukturell hoher Kriminalitätsbelastung. Traumatisierungen und fehlende psychische Versorgung nach Fluchterfahrung erhöhen Gewaltbereitschaft. Mit diesen Kontrollen verbleibt nur noch ein geringer Rest-Unterschied.',
    citation: 'ifo-Studie 2025, WHO-Daten zu Fluchttrauma',
  },
]
</script>

<template>
  <FaktorDekomposition
    title="Wie aus 'zehnfach' 'kaum höher' wird"
    subtitle="Illustrative Dekomposition der TVBZ männlicher Afghanen und Syrer im Verhältnis zu männlichen Deutschen. Die Korrekturen folgen den bekannten kriminologischen Kontrollvariablen."
    baseline-label="Deutsche (Männer)"
    target-label="Afghanen / Syrer (Männer)"
    :steps="steps"
    :max-factor="10"
  />
</template>
