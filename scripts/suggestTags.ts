#!/usr/bin/env npx tsx
/**
 * Schlägt neue Tags für Quellenlinks mit weniger als 4 Tags vor.
 * Strategie: Elternquelle → Parteien, Titel → Themen-Keywords.
 * coSources werden NICHT als Tags eingetragen — sie sind bereits als Graph-Kanten erfasst.
 * Ausgabe als YAML-Blöcke zur manuellen Übernahme.
 */
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const INDEX_FILE = join(import.meta.dirname, '..', '..', 'knowledge-mcp', '_sourceindex.json')

const PARTIES = ['CDU', 'CSU', 'SPD', 'Grüne', 'FDP', 'AfD', 'BSW', 'Linke']

const TOPIC_KEYWORDS: [RegExp, string][] = [
  // Energie
  [/kernkraft|atomkraft|atomausstieg|\bakw\b|smr|mini-atom|reaktor/i, 'Kernkraft'],
  [/solar|photovoltaik|pv-ausbau/i, 'Solarenergie'],
  [/windkraft|windrad|windpark|windenergie/i, 'Windkraft'],
  [/energiewende|erneuerbare energie|ökostrom/i, 'Energiewende'],
  [/energiepolitik|strompreis|eeg-umlage|netzentgelt|redispatch/i, 'Energiepolitik'],
  [/klima(?!schutz)|co2|emission|treibhausgas|erderwärmung/i, 'Klima'],
  [/klimaschutz|klimaziel|paris-abkommen|dekarbonisierung/i, 'Klimaschutz'],
  [/kohle(?:ausstieg|kraftwerk|abbau)|braunkohle|steinkohle/i, 'Kohle'],
  // Wirtschaft & Soziales
  [/arbeitsmarkt|arbeitslos|beschäftigung|erwerbstätig/i, 'Arbeitsmarkt'],
  [/rente|altersversorgung|rentenversicherung|rentenniveau/i, 'Rente'],
  [/mindestlohn|lohn(?:lücke|ungleich)|einkommen/i, 'Lohnpolitik'],
  [/inflation|preissteigerung|kaufkraft/i, 'Inflation'],
  [/wohnungsmangel|mietpreise?|wohnkosten|wohnungsnot/i, 'Wohnungspolitik'],
  [/haushalt(?:sdefizit|sloch|splan)|schuldenbremse|staatsverschuldung/i, 'Haushaltspolitik'],
  [/bürgergeld|hartz|sozialhilfe|grundsicherung/i, 'Sozialpolitik'],
  // Migration & Integration
  [/migration|flüchtling|geflüchtet|asyl|abschieb|einwanderung/i, 'Migration'],
  [/integration|parallelgesellschaft|deutschkenntnisse/i, 'Integration'],
  [/abschiebung|rückführung|ausreisepflicht/i, 'Abschiebung'],
  // Rechtsextremismus & Demokratie
  [/rechtsextrem|neonazi|neo-nazi|rechtsradik/i, 'Rechtsextremismus'],
  [/rechtsterror|politische gewalt|anschlag|attentat/i, 'Rechtsterrorismus'],
  [/verfassungsschutz|verfassungswidrig|verfassungsfeindlich/i, 'Verfassungsschutz'],
  [/antisemitismus|judenfeindlich|holocaust-leugnung/i, 'Antisemitismus'],
  [/verschwörung|querdenk|impfgegner/i, 'Verschwörungsideologie'],
  // Desinformation
  [/desinformation|falschbehauptung|falschmeldung|lüge/i, 'Desinformation'],
  [/faktencheck|faktenfehler|richtigstellung/i, 'Faktencheck'],
  [/manipulation|propaganda|narrative|framing/i, 'Propaganda'],
  [/ki-generiert|künstliche intelligenz.*bild|fake.*foto|gefälscht.*bild/i, 'KI-Desinformation'],
  // Geopolitik
  [/russland|putin|ukraine-krieg|nato/i, 'Russland'],
  [/ukraine/i, 'Ukraine'],
  [/\busa\b|trump|biden|harris|republican/i, 'USA'],
  [/israel|gaza|nahost|palästina/i, 'Nahost'],
  [/china\b/i, 'China'],
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

  const slugToTags = new Map(sources.map(s => [s.slug, s.tags]))

  const underTagged = links.filter(l => l.tags.length < 4)
  process.stderr.write(`Links with <4 tags: ${underTagged.length} of ${links.length}\n`)

  let suggestions = 0

  for (const link of underTagged) {
    const existing = new Set(link.tags)
    const proposed: string[] = []

    // 1. Parteien aus Elternquelle
    const parentSlug = link.source.split('/').pop()!
    for (const tag of slugToTags.get(parentSlug) ?? []) {
      if (PARTIES.includes(tag) && !existing.has(tag) && !proposed.includes(tag)) proposed.push(tag)
    }

    // 2. Themen-Keywords aus Titel + Summary
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
