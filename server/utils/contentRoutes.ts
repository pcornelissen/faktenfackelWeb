export const ALLOWED_COLLECTIONS = [
  'faktenchecks',
  'lagerfeuer',
  'glossar',
  'news',
  'themen',
  'quellen',
  'quellenlinks',
  'zitate',
] as const

export type AllowedCollection = typeof ALLOWED_COLLECTIONS[number]

export function isCollection(x: unknown): x is AllowedCollection {
  return typeof x === 'string' && (ALLOWED_COLLECTIONS as readonly string[]).includes(x)
}

export function today(): string {
  return new Date().toISOString().slice(0, 10)
}
