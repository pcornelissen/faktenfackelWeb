#!/usr/bin/env node
/**
 * Dekodiert die Nuxt Content SQL-Dumps und importiert sie direkt in D1.
 * Wird im CI nach dem Worker-Deploy aufgerufen, damit der erste Request
 * keine 90-Sekunden-Initialisierung mehr auslöst.
 *
 * Usage: node scripts/populate-d1.mjs
 * Requires: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID (env)
 */

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'

const DB_NAME = 'fackel1'
const COLLECTIONS = ['news', 'glossar', 'zitate', 'faktenchecks', 'lagerfeuer', 'quellen', 'quellenlinks']

let ok = 0
let skipped = 0

for (const collection of COLLECTIONS) {
  const dumpFile = `.output/public/dump.${collection}.sql`

  if (!existsSync(dumpFile)) {
    console.log(`⏭  ${collection}: kein Dump gefunden, übersprungen`)
    skipped++
    continue
  }

  process.stdout.write(`📥 ${collection}: Dekodiere...`)
  const compressed = readFileSync(dumpFile, 'utf8').trim()
  const decompressed = gunzipSync(Buffer.from(compressed, 'base64')).toString('utf8')
  const statements = JSON.parse(decompressed)

  // Tabellennamen aus CREATE TABLE-Statements extrahieren und vorher droppen,
  // damit veraltete Einträge entfernt werden und UNIQUE-Constraints nicht feuern
  const dropStatements = statements
    .filter(s => /^CREATE TABLE/i.test(s))
    .map(s => {
      const match = s.match(/^CREATE TABLE(?:\s+IF NOT EXISTS)?\s+"?(\w+)"?/i)
      return match ? `DROP TABLE IF EXISTS "${match[1]}";` : null
    })
    .filter(Boolean)

  const sqlFile = `/tmp/d1_dump_${collection}.sql`
  writeFileSync(sqlFile, [...dropStatements, ...statements].join('\n'))
  process.stdout.write(` ${statements.length} Statements (${(decompressed.length / 1024).toFixed(0)} KB)... `)

  execFileSync('npx', ['wrangler', 'd1', 'execute', DB_NAME, '--remote', '--file', sqlFile], {
    stdio: ['ignore', 'ignore', 'inherit'],
  })
  console.log('✓')
  ok++
}

console.log(`\nD1 Import abgeschlossen: ${ok} Collections importiert, ${skipped} übersprungen.`)
