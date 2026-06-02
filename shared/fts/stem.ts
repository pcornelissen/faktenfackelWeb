import { newStemmer } from 'snowball-stemmers'

const stemmer = newStemmer('german')

// Tokenisiert auf Buchstaben (inkl. Umlaute/ß) und Ziffern, lowercased, stemmt je Token.
const TOKEN_RE = /[\p{L}\p{N}]+/gu

export function stemGerman(text: string): string {
  if (!text) return ''
  const tokens = text.toLowerCase().match(TOKEN_RE)
  if (!tokens) return ''
  return tokens.map(t => stemmer.stem(t)).join(' ')
}

// Für die Query: einzelne gestemmte Tokens (für Prefix-MATCH-Aufbau).
export function stemTokens(text: string): string[] {
  const out = stemGerman(text)
  return out ? out.split(' ') : []
}
