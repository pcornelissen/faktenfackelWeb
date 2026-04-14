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

// Alle Dumps einlesen und dekodieren
const dumps = []
for (const collection of COLLECTIONS) {
  const dumpFile = `.output/public/dump.${collection}.sql`
  if (!existsSync(dumpFile)) continue
  const compressed = readFileSync(dumpFile, 'utf8').trim()
  const decompressed = gunzipSync(Buffer.from(compressed, 'base64')).toString('utf8')
  dumps.push({ collection, statements: JSON.parse(decompressed) })
}

// Alle Tabellennamen aus allen Dumps einsammeln und vorab droppen
const allTables = new Set()
for (const { statements } of dumps) {
  for (const s of statements) {
    const match = s.match(/^CREATE TABLE(?:\s+IF NOT EXISTS)?\s+"?(\w+)"?/i)
    if (match) allTables.add(match[1])
  }
}

if (allTables.size > 0) {
  console.log(`🗑  Droppe ${allTables.size} Tabellen: ${[...allTables].join(', ')}`)
  const dropSql = [...allTables].map(t => `DROP TABLE IF EXISTS "${t}";`).join('\n')
  writeFileSync('/tmp/d1_drop_all.sql', dropSql)
  execFileSync('npx', ['wrangler', 'd1', 'execute', DB_NAME, '--remote', '--file', '/tmp/d1_drop_all.sql'], {
    stdio: ['ignore', 'ignore', 'inherit'],
  })
}

// Collections importieren
let ok = 0
let skipped = COLLECTIONS.length - dumps.length

for (const { collection, statements } of dumps) {
  process.stdout.write(`📥 ${collection}: ${statements.length} Statements (${(JSON.stringify(statements).length / 1024).toFixed(0)} KB)... `)
  // INSERT OR REPLACE verhindert UNIQUE-Konflikte wenn mehrere Dumps
  // dieselbe Tabelle befüllen (z.B. quellen- und quellenlinks-Dump)
  const normalized = statements.map(s => s.replace(/^INSERT INTO /i, 'INSERT OR REPLACE INTO '))
  const sqlFile = `/tmp/d1_dump_${collection}.sql`
  writeFileSync(sqlFile, normalized.join('\n'))
  execFileSync('npx', ['wrangler', 'd1', 'execute', DB_NAME, '--remote', '--file', sqlFile], {
    stdio: ['ignore', 'ignore', 'inherit'],
  })
  console.log('✓')
  ok++
}

console.log(`\nD1 Import abgeschlossen: ${ok} Collections importiert, ${skipped} übersprungen.`)
