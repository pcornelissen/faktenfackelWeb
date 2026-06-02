// Node-runtime FTS-DB-Treiber.
// Oeffnet fts.sqlite read-only als better-sqlite3-Instanz (synchron).
// Memoized-Singleton: erste Anfrage oeffnet die DB, alle weiteren erhalten
// dieselbe Instanz (analog graphDb.node.ts).

import { existsSync } from 'node:fs'
import Database from 'better-sqlite3'

const DEFAULT_PATH = './.data/fts.sqlite'
let db: Database.Database | null = null

export function getFtsDb(): Database.Database {
  if (db) return db
  const path = process.env.FTS_DB_PATH || DEFAULT_PATH
  if (!existsSync(path)) {
    throw new Error(`FTS DB file not found at ${path} (set FTS_DB_PATH to override)`)
  }
  db = new Database(path, { readonly: true, fileMustExist: true })
  return db
}
