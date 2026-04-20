<script setup lang="ts">
const steps = [
  {
    factor: 4.0,
    label: 'Dobrindts Framing',
    desc: 'Die Rohzahl aus der PKS, ohne methodische Einordnung. So präsentiert, wirkt die Gruppe pauschal "viermal krimineller".',
    citation: 'Bundespressekonferenz PKS 2025, 20. April 2026',
  },
  {
    factor: 2.6,
    label: 'Ohne Kontrolldelikte',
    desc: 'Ausländerrechtliche Verstöße (z.B. unerlaubte Einreise nach § 95 AufenthG) können fast nur von Nicht-Deutschen begangen werden. Rechnet man sie heraus, schrumpft der Faktor auf 2,6.',
    citation: 'Mediendienst Integration (TVBZ ohne §-95-Delikte, PKS 2025)',
  },
  {
    factor: 1.9,
    label: 'Ohne Besuchsverkehr',
    desc: 'Rund 27 % der ausländischen Tatverdächtigen leben gar nicht in Deutschland (Touristen, Grenzpendler, Durchreisende). Sie fließen in die Zähler-, aber nicht in die Nenner-Seite der TVBZ ein.',
    citation: 'PKS-Wohnsitzauswertung, illustrativ',
  },
  {
    factor: 1.3,
    label: 'Ohne Demografie',
    desc: 'Ausländische Bevölkerung ist im Schnitt jünger und männlicher. Junge Männer haben in allen Gesellschaften höhere Kriminalitätsraten - unabhängig von Herkunft.',
    citation: 'ifo-Studie Adema/Alipour 2025 (Alters- und Geschlechtskontrolle)',
  },
  {
    factor: 1.0,
    label: 'Ohne Wohnort-Effekt',
    desc: 'Ausländer leben häufiger in Ballungsräumen mit strukturell höherer Kriminalität - ein Effekt, der für alle dort Wohnenden gilt. Kontrolliert man dafür, verschwindet der Zusammenhang statistisch weitgehend.',
    citation: 'ifo-Studie: rund 90 % der regionalen Unterschiede durch Ortsfaktoren',
  },
]
</script>

<template>
  <FaktorDekomposition
    title="Wie aus 'viermal krimineller' 'gleich häufig' wird"
    subtitle="Illustrative Dekomposition der Tatverdächtigenbelastungszahl (TVBZ) von Ausländern im Verhältnis zu Deutschen. Klick dich durch die Korrekturen."
    baseline-label="Deutsche"
    target-label="Ausländer"
    :steps="steps"
    :max-factor="4"
  />
</template>
