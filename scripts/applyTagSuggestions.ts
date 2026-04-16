#!/usr/bin/env npx tsx
/**
 * Schreibt Tag-Vorschläge direkt in die Frontmatter der Quellenlink-Markdown-Dateien.
 * Gleiche Logik wie suggestTags.ts, aber schreibt statt YAML auszugeben.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'

const INDEX_FILE = join(import.meta.dirname, '..', '..', 'knowledge-mcp', '_sourceindex.json')
const CONTENT_DIR = join(import.meta.dirname, '..', 'content', 'quellen')

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

// Tag-Validierung: nur Buchstaben, Zahlen, Bindestriche und Leerzeichen
function isValidTag(tag: string): boolean {
  return /^[\p{L}\p{N}\- ]+$/u.test(tag)
}

// Normalisierung für Duplikat-Erkennung
function normalizeTag(tag: string): string {
  return tag.toLowerCase().replace(/[-\s]/g, '')
}

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

async function findAllLinkFiles(dir: string): Promise<string[]> {
  const results: string[] = []
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return results
  }
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'links') {
        // collect .md files directly inside
        const linkEntries = await readdir(fullPath, { withFileTypes: true })
        for (const le of linkEntries) {
          if (le.isFile() && le.name.endsWith('.md')) {
            results.push(join(fullPath, le.name))
          }
        }
      } else {
        const sub = await findAllLinkFiles(fullPath)
        results.push(...sub)
      }
    }
  }
  return results
}

async function findMarkdownFile(code: string, allFiles: string[]): Promise<string | null> {
  const exactPattern = new RegExp(`^code:\\s+${code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm')
  for (const filePath of allFiles) {
    const content = await readFile(filePath, 'utf-8')
    if (exactPattern.test(content)) {
      return filePath
    }
  }
  return null
}

function updateTagsInFrontmatter(content: string, newTags: string[]): string {
  // Findet den tags:-Block im Frontmatter und ersetzt ihn
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!frontmatterMatch) return content

  const frontmatter = frontmatterMatch[1]

  // Prüfe ob tags-Block existiert
  const tagsBlockMatch = frontmatter.match(/^tags:\n((?:  - .*\n?)*)/m)

  const newTagsBlock = `tags:\n${newTags.map(t => `  - ${t}`).join('\n')}`

  if (tagsBlockMatch) {
    // Ersetze bestehenden tags-Block
    return content.replace(/^tags:\n((?:  - .*\n?)*)(?=\S|$)/m, newTagsBlock + '\n')
  } else {
    // Füge tags-Block am Ende des Frontmatters ein
    const newFrontmatter = frontmatter + '\n' + newTagsBlock
    return content.replace(/^---\n([\s\S]*?)\n---/, `---\n${newFrontmatter}\n---`)
  }
}

async function main() {
  const raw = JSON.parse(await readFile(INDEX_FILE, 'utf-8'))
  const sources: Source[] = raw.sources
  const links: Link[] = raw.links

  const slugToTags = new Map(sources.map(s => [s.slug, s.tags]))

  const underTagged = links.filter(l => l.tags.length < 4)
  process.stderr.write(`Links mit <4 Tags: ${underTagged.length} von ${links.length}\n`)

  // Alle Quellenlink-Markdown-Dateien einmalig einlesen
  const allFiles = await findAllLinkFiles(CONTENT_DIR)

  let linksWithSuggestions = 0
  let tagsWritten = 0
  let filesChanged = 0
  let tagsSkipped = 0

  for (const link of underTagged) {
    if (!link.code) {
      process.stderr.write(`WARN: Link ohne code-Feld übersprungen: ${link.source}\n`)
      continue
    }
    const existing = new Set(link.tags)
    const existingNormalized = new Set(link.tags.map(normalizeTag))
    const proposed: string[] = []

    // 1. Parteien aus Elternquelle
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
    linksWithSuggestions++

    // Filterregeln anwenden
    const toAdd: string[] = []
    for (const tag of proposed) {
      // URL-unsafe Zeichen (außer - und Leerzeichen)
      if (!isValidTag(tag)) {
        tagsSkipped++
        continue
      }
      // Zu lang
      if (tag.length > 40) {
        tagsSkipped++
        continue
      }
      // Normalisierter Duplikat-Check
      if (existingNormalized.has(normalizeTag(tag))) {
        tagsSkipped++
        continue
      }
      // Case-insensitive Duplikat-Check
      if (link.tags.some(t => t.toLowerCase() === tag.toLowerCase())) {
        tagsSkipped++
        continue
      }
      toAdd.push(tag)
    }

    if (toAdd.length === 0) continue

    // Markdown-Datei finden
    const filePath = await findMarkdownFile(link.code, allFiles)
    if (!filePath) {
      process.stderr.write(`WARN: Datei für code "${link.code}" nicht gefunden\n`)
      continue
    }

    // Datei lesen, aktualisieren und schreiben
    const fileContent = await readFile(filePath, 'utf-8')
    const newTags = [...link.tags, ...toAdd]
    const updatedContent = updateTagsInFrontmatter(fileContent, newTags)

    if (updatedContent === fileContent) {
      process.stderr.write(`WARN: Keine Änderung in ${filePath}\n`)
      continue
    }

    await writeFile(filePath, updatedContent, 'utf-8')
    tagsWritten += toAdd.length
    filesChanged++
  }

  process.stderr.write(`\nLinks mit Vorschlägen: ${linksWithSuggestions}\n`)
  process.stderr.write(`Tags eingetragen: ${tagsWritten} (in ${filesChanged} Dateien)\n`)
  process.stderr.write(`Übersprungen (Filter): ${tagsSkipped}\n`)
}

main().catch(console.error)
