#!/usr/bin/env npx tsx
/**
 * Schlägt neue Tags für Quellenlinks mit weniger als 4 Tags vor.
 * Strategie: coSources → Personennamen, Elternquelle → Parteien, Titel → Themen-Keywords.
 * Ausgabe als YAML-Blöcke zur manuellen Übernahme.
 */
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const INDEX_FILE = join(import.meta.dirname, '..', '..', 'knowledge-mcp', '_sourceindex.json')

const PARTIES = ['CDU', 'CSU', 'SPD', 'Grüne', 'FDP', 'AfD', 'BSW', 'Linke']

const TOPIC_KEYWORDS: [RegExp, string][] = [
  [/kernkraft|atomkraft|akw|smr|reaktor/i, 'Kernkraft'],
  [/solar|photovoltaik|pv-ausbau/i, 'Solarenergie'],
  [/windkraft|windrad|windpark/i, 'Windkraft'],
  [/energiewende|erneuerbare/i, 'Energiewende'],
  [/migration|flüchtling|asyl|abschieb/i, 'Migration'],
  [/klima|co2|emission|treibhausgas/i, 'Klima'],
  [/desinformation|faktencheck|falschbehauptung/i, 'Desinformation'],
  [/rechtsextrem|neonazi/i, 'Rechtsextremismus'],
]

interface Link {
  code: string
  source: string
  title: string
  tags: string[]
  coSources?: string[]
  summary?: string
}
interface Source {
  slug: string
  name: string
  tags: string[]
}

async function main() {
  const raw = JSON.parse(await readFile(INDEX_FILE, 'utf-8'))
  const sources: Source[] = raw.sources
  const links: Link[] = raw.links

  const slugToName = new Map(sources.map(s => [s.slug, s.name]))
  const slugToTags = new Map(sources.map(s => [s.slug, s.tags]))

  const underTagged = links.filter(l => l.tags.length < 4)
  process.stderr.write(`Links with <4 tags: ${underTagged.length} of ${links.length}\n`)

  let suggestions = 0

  for (const link of underTagged) {
    const existing = new Set(link.tags)
    const proposed: string[] = []

    // 1. Namen aus coSources
    for (const cs of link.coSources ?? []) {
      const slug = cs.includes('/') ? cs.split('/').pop()! : cs
      const name = slugToName.get(slug)
      if (name && !existing.has(name) && !proposed.includes(name)) proposed.push(name)
    }

    // 2. Parteien aus Elternquelle
    const parentSlug = link.source.split('/').pop()!
    for (const tag of slugToTags.get(parentSlug) ?? []) {
      if (PARTIES.includes(tag) && !existing.has(tag) && !proposed.includes(tag)) proposed.push(tag)
    }

    // 3. Themen-Keywords aus Titel + Summary
    const text = `${link.title} ${link.summary ?? ''}`
    for (const [regex, tag] of TOPIC_KEYWORDS) {
      if (regex.test(text) && !existing.has(tag) && !proposed.includes(tag)) proposed.push(tag)
    }

    if (proposed.length === 0) continue

    suggestions++
    console.log(`\n# ${link.code}`)
    console.log(`# Titel: ${link.title}`)
    console.log(`# Aktuell (${link.tags.length} Tags): [${link.tags.join(', ')}]`)
    console.log(`# Vorschlag:`)
    console.log(`tags:`)
    for (const t of [...link.tags, ...proposed]) console.log(`  - ${t}`)
  }

  process.stderr.write(`Links with suggestions: ${suggestions}\n`)
}

main().catch(console.error)
