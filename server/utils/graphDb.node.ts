// Node-runtime GraphDB driver.
// Wraps better-sqlite3 (synchronous) in the D1-compatible interface
// that graphDb.ts exposes to server handlers.

import { existsSync } from 'node:fs'
import Database from 'better-sqlite3'
import type { D1Database, D1PreparedStatement } from './graphDb'

const DEFAULT_PATH = './.data/graph.sqlite'

export async function openLocalGraphDb(): Promise<D1Database> {
  const path = process.env.GRAPH_DB_PATH || DEFAULT_PATH
  if (!existsSync(path)) {
    throw new Error(`GraphDB file not found at ${path} (set GRAPH_DB_PATH to override)`)
  }

  const sqlite = new Database(path, { readonly: true, fileMustExist: true })
  // WAL is irrelevant for read-only opens, but querying memory-mapped pages helps.
  sqlite.pragma('mmap_size = 67108864')

  const prepare = (sql: string): D1PreparedStatement => {
    const stmt = sqlite.prepare(sql)
    let bindings: unknown[] = []
    const wrapped: D1PreparedStatement = {
      bind: (...values: unknown[]) => {
        bindings = values
        return wrapped
      },
      first: async <T = Record<string, unknown>>() => {
        const row = stmt.get(...(bindings as never[])) as T | undefined
        return row ?? null
      },
      all: async <T = Record<string, unknown>>() => {
        return { results: stmt.all(...(bindings as never[])) as T[] }
      },
      run: async () => {
        stmt.run(...(bindings as never[]))
        return { success: true }
      },
    }
    return wrapped
  }

  return { prepare }
}
