<script setup lang="ts">
type DataPoint = {
  year: number
  west: number
  ost: number | null
}

// Arbeitslosenquote in % (Bundesagentur für Arbeit, bezogen auf alle zivilen Erwerbspersonen)
// Ost-Daten erst ab 1991 verfügbar
const data: DataPoint[] = [
  { year: 1989, west: 5.6, ost: null },
  { year: 1990, west: 5.2, ost: null },
  { year: 1991, west: 5.3, ost: 10.2 },
  { year: 1992, west: 5.7, ost: 14.4 },
  { year: 1993, west: 7.3, ost: 15.4 },
  { year: 1994, west: 8.1, ost: 15.7 },
  { year: 1995, west: 8.3, ost: 14.9 },
  { year: 1996, west: 9.1, ost: 16.7 },
  { year: 1997, west: 9.8, ost: 19.1 },
  { year: 1998, west: 9.4, ost: 18.2 },
  { year: 1999, west: 8.8, ost: 17.6 },
  { year: 2000, west: 7.8, ost: 17.4 },
  { year: 2001, west: 7.4, ost: 17.5 },
  { year: 2002, west: 7.6, ost: 17.7 },
  { year: 2003, west: 8.4, ost: 18.5 },
  { year: 2004, west: 8.5, ost: 18.4 },
  { year: 2005, west: 9.9, ost: 18.7 },
  { year: 2006, west: 9.1, ost: 17.3 },
  { year: 2007, west: 7.5, ost: 15.1 },
  { year: 2008, west: 6.4, ost: 13.1 },
  { year: 2009, west: 6.9, ost: 13.0 },
  { year: 2010, west: 6.6, ost: 12.0 },
  { year: 2011, west: 6.0, ost: 11.3 },
  { year: 2012, west: 5.9, ost: 10.7 },
  { year: 2013, west: 5.9, ost: 10.3 },
  { year: 2014, west: 5.8, ost: 9.8 },
  { year: 2015, west: 5.6, ost: 9.2 },
  { year: 2016, west: 5.3, ost: 8.5 },
  { year: 2017, west: 5.0, ost: 7.6 },
  { year: 2018, west: 4.7, ost: 6.9 },
  { year: 2019, west: 4.7, ost: 6.4 },
  { year: 2020, west: 5.5, ost: 7.3 },
  { year: 2021, west: 5.2, ost: 7.1 },
  { year: 2022, west: 4.9, ost: 6.7 },
  { year: 2023, west: 5.3, ost: 7.2 },
  { year: 2024, west: 5.7, ost: 7.5 },
]

const chartWidth = 760
const chartHeight = 380
const padding = { top: 24, right: 24, bottom: 52, left: 48 }

const innerWidth = chartWidth - padding.left - padding.right
const innerHeight = chartHeight - padding.top - padding.bottom

const minYear = 1989
const maxYear = 2024
const maxVal = 20

function x(year: number): number {
  return padding.left + ((year - minYear) / (maxYear - minYear)) * innerWidth
}

function y(val: number): number {
  return padding.top + innerHeight - (val / maxVal) * innerHeight
}

const westPath = data
  .map((d, i) => `${i === 0 ? 'M' : 'L'}${x(d.year).toFixed(1)},${y(d.west).toFixed(1)}`)
  .join(' ')

const ostPoints = data.filter(d => d.ost !== null)
const ostPath = ostPoints
  .map((d, i) => `${i === 0 ? 'M' : 'L'}${x(d.year).toFixed(1)},${y(d.ost!).toFixed(1)}`)
  .join(' ')

const yTicks = [0, 5, 10, 15, 20]
const xTicks = [1990, 1995, 2000, 2005, 2010, 2015, 2020, 2024]

type Annotation = { year: number, label: string, yOffset: number }
const annotations: Annotation[] = [
  { year: 1990, label: 'Wiedervereinigung', yOffset: -8 },
  { year: 2005, label: 'Hartz IV', yOffset: -8 },
]
</script>

<template>
  <figure
    class="chart-figure"
    role="img"
    aria-label="Arbeitslosenquote Ost vs. West, 1989 bis 2024"
  >
    <svg
      :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
      preserveAspectRatio="xMidYMid meet"
      style="width: 100%; height: auto; max-width: 760px; display: block; margin: 1.5rem auto;"
    >
      <text
        :x="chartWidth / 2"
        :y="12"
        text-anchor="middle"
        font-family="'Playfair Display', serif"
        font-size="15"
        font-weight="700"
        fill="var(--ink)"
      >Arbeitslosenquote: Ost vs. West (1989-2024)</text>

      <!-- grid lines -->
      <line
        v-for="tick in yTicks"
        :key="'grid-' + tick"
        :x1="padding.left"
        :y1="y(tick)"
        :x2="chartWidth - padding.right"
        :y2="y(tick)"
        stroke="var(--fackel-border)"
        stroke-width="0.5"
      />

      <!-- Y axis labels -->
      <text
        v-for="tick in yTicks"
        :key="'y-' + tick"
        :x="padding.left - 8"
        :y="y(tick) + 4"
        text-anchor="end"
        font-family="'Ubuntu Mono', monospace"
        font-size="11"
        fill="var(--muted)"
      >{{ tick }} %</text>

      <!-- X axis labels -->
      <text
        v-for="tick in xTicks"
        :key="'x-' + tick"
        :x="x(tick)"
        :y="chartHeight - padding.bottom + 18"
        text-anchor="middle"
        font-family="'Ubuntu Mono', monospace"
        font-size="11"
        fill="var(--muted)"
      >{{ tick }}</text>

      <!-- annotation lines -->
      <line
        v-for="a in annotations"
        :key="'ann-' + a.year"
        :x1="x(a.year)"
        :y1="padding.top"
        :x2="x(a.year)"
        :y2="padding.top + innerHeight"
        stroke="var(--fackel-border)"
        stroke-width="1"
        stroke-dasharray="4 3"
      />
      <text
        v-for="a in annotations"
        :key="'ann-label-' + a.year"
        :x="x(a.year)"
        :y="chartHeight - padding.bottom + 32"
        text-anchor="middle"
        font-family="'Ubuntu Mono', monospace"
        font-size="10"
        fill="var(--muted)"
      >{{ a.label }}</text>

      <!-- West line -->
      <path
        :d="westPath"
        fill="none"
        stroke="var(--muted)"
        stroke-width="2.5"
        stroke-linejoin="round"
      />

      <!-- Ost line -->
      <path
        :d="ostPath"
        fill="none"
        stroke="var(--ember)"
        stroke-width="2.5"
        stroke-linejoin="round"
      />

      <!-- Legend -->
      <line
        :x1="chartWidth - padding.right - 120"
        :y1="padding.top + 16"
        :x2="chartWidth - padding.right - 100"
        :y2="padding.top + 16"
        stroke="var(--ember)"
        stroke-width="2.5"
      />
      <text
        :x="chartWidth - padding.right - 96"
        :y="padding.top + 20"
        font-family="'Ubuntu Mono', monospace"
        font-size="11"
        fill="var(--ink)"
      >Ostdeutschland</text>

      <line
        :x1="chartWidth - padding.right - 120"
        :y1="padding.top + 32"
        :x2="chartWidth - padding.right - 100"
        :y2="padding.top + 32"
        stroke="var(--muted)"
        stroke-width="2.5"
      />
      <text
        :x="chartWidth - padding.right - 96"
        :y="padding.top + 36"
        font-family="'Ubuntu Mono', monospace"
        font-size="11"
        fill="var(--ink)"
      >Westdeutschland</text>

      <!-- Peak label Ost -->
      <text
        :x="x(1997) + 4"
        :y="y(19.1) - 8"
        font-family="'Ubuntu Mono', monospace"
        font-size="10"
        fill="var(--ember)"
      >19,1 %</text>

      <!-- Peak label West -->
      <text
        :x="x(2005) + 4"
        :y="y(9.9) + 16"
        font-family="'Ubuntu Mono', monospace"
        font-size="10"
        fill="var(--muted)"
      >9,9 %</text>
    </svg>
    <figcaption style="text-align: center; font-family: 'Ubuntu Mono', monospace; font-size: 0.72rem; color: var(--muted); margin-top: 0.25rem;">
      Quelle: Bundesagentur für Arbeit, Arbeitslosenquote bezogen auf alle zivilen Erwerbspersonen (Jahresdurchschnitte)
    </figcaption>
  </figure>
</template>
