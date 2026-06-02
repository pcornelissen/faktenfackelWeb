import { describe, it, expect } from 'vitest'
import { isPreview, todayIso } from './published'

describe('published helper', () => {
  it('isPreview true nur bei siteEnv dev', () => {
    expect(isPreview('dev')).toBe(true)
    expect(isPreview('prod')).toBe(false)
    expect(isPreview(undefined)).toBe(false)
  })
  it('todayIso liefert YYYY-MM-DD', () => {
    expect(todayIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
