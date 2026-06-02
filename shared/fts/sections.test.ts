import { describe, it, expect } from 'vitest'
import { extractSections, minimarkToText } from './sections'

const body = {
  type: 'minimark',
  value: [
    ['p', {}, 'Einleitung über Impfungen.'],
    ['h2', { id: 'bewertung' }, 'Bewertung'],
    ['p', {}, 'Die Behauptung ist ', ['strong', {}, 'falsch'], '.'],
  ],
}

describe('minimarkToText', () => {
  it('sammelt verschachtelten Text', () => {
    expect(minimarkToText(['p', {}, 'a ', ['em', {}, 'b']])).toBe('a b')
  })
})

describe('extractSections', () => {
  it('erste Sektion trägt den Seitentitel, Headings starten neue Sektionen', () => {
    const secs = extractSections(body, { path: '/x', title: 'Titel' })
    expect(secs[0]!.title).toBe('Titel')
    expect(secs[0]!.content).toContain('Einleitung')
    expect(secs[1]!.title).toBe('Bewertung')
    expect(secs[1]!.content).toContain('falsch')
    expect(secs[1]!.breadcrumb).toBe('Titel')
  })
  it('robust gegen kaputten/leeren body', () => {
    expect(extractSections(null, { path: '/x', title: 'T' })).toEqual([])
  })
})
