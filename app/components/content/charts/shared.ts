export interface Serie {
  label: string
  values: number[]
  color?: string
}

// CI-Palette: Flame/Ember zuerst, dann ruhige Grau-/Sandtöne.
export const PALETTE = ['var(--flame)', 'var(--ember)', '#78716C', '#525252', '#A8A29E', '#C7BCA9']

export function colorFor(i: number, explicit?: string): string {
  return explicit || PALETTE[i % PALETTE.length]!
}

// Schmales geschütztes Leerzeichen (U+202F) zwischen Zahl und Einheit. Via
// String.fromCharCode statt Literal, damit ESLint (no-irregular-whitespace) nicht anschlägt.
const NBSP = String.fromCharCode(0x202F)

// Deutsches Zahlenformat, an AltersgruppenBalken angelehnt.
export function formatValue(v: number, unit?: string): string {
  if (unit === '%') return v.toFixed(1).replace('.', ',') + NBSP + '%'
  if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(1).replace('.', ',') + NBSP + 'Mio.'
  if (Math.abs(v) >= 1_000) return (v / 1_000).toFixed(0) + NBSP + 'Tsd.'
  return String(v).replace('.', ',')
}

// Rundet einen Maximalwert auf eine "schöne" Achsen-Obergrenze (1/2/5 × 10^n).
export function niceMax(max: number): number {
  if (max <= 0) return 1
  const mag = 10 ** Math.floor(Math.log10(max))
  const norm = max / mag
  const niceNorm = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10
  return niceNorm * mag
}

// count+1 gleichmäßige Tick-Werte 0..max.
export function ticks(max: number, count = 4): number[] {
  return Array.from({ length: count + 1 }, (_, i) => (i * max) / count)
}
