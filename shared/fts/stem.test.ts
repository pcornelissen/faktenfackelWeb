import { describe, it, expect } from 'vitest'
import { stemGerman } from './stem'

describe('stemGerman', () => {
  it('stemmt Singular und Plural auf denselben Stamm', () => {
    expect(stemGerman('Impfung')).toBe(stemGerman('Impfungen'))
  })
  it('lowercased, tokenisiert auf Wortgrenzen, behält Zahlen', () => {
    const out = stemGerman('Die AfD 2026!')
    expect(out.split(' ')).toContain('2026')
    expect(out).toBe(out.toLowerCase())
  })
  it('leerer Input → leerer String', () => {
    expect(stemGerman('')).toBe('')
  })
})
