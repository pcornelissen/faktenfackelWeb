import { describe, it, expect } from 'vitest'
import { nodeToHref } from './graphData'

describe('nodeToHref', () => {
  it('strippt das YYYYMMDD.-Order-Präfix aus Quellenlink-Pfaden (wie @nuxt/content)', () => {
    expect(nodeToHref({ type: 'link', path: 'medien/taz/links/20260415.berlin-friedrichshain-machete-angriff-neonazis' }))
      .toBe('/quellen/medien/taz/links/berlin-friedrichshain-machete-angriff-neonazis')
  })

  it('lässt Quellen-Pfade ohne Datum unverändert', () => {
    expect(nodeToHref({ type: 'source', path: 'medien/taz' })).toBe('/quellen/medien/taz')
  })

  it('lässt Bindestrich-Datumspräfixe (z.B. 2026-04-24.) unangetastet — die strippt @nuxt/content auch nicht', () => {
    expect(nodeToHref({ type: 'article', path: 'lagerfeuer/perspektiven/2026-04-24.afd-gewalt-dossier' }))
      .toBe('/lagerfeuer/perspektiven/2026-04-24.afd-gewalt-dossier')
  })

  it('toleriert führende Slashes und leere Pfade', () => {
    expect(nodeToHref({ type: 'link', path: '/medien/taz/links/20260415.foo' })).toBe('/quellen/medien/taz/links/foo')
    expect(nodeToHref({ type: 'link', path: null })).toBe('#')
  })
})
