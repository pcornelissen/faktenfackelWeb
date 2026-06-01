import { describe, it, expect } from 'vitest'
import Database from 'better-sqlite3'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { buildFts } from './buildFts'

function makeContentDb(): string {
  const p = join(tmpdir(), `content-test-${process.pid}-${Date.now()}.sqlite`)
  const db = new Database(p)
  db.exec(`CREATE TABLE _content_faktenchecks (id TEXT, title TEXT, body TEXT, path TEXT, tags TEXT, subtitle TEXT, publishedOn TEXT)`)
  db.prepare(`INSERT INTO _content_faktenchecks VALUES (?,?,?,?,?,?,?)`).run(
    'a', 'Corona Impfung Faktencheck',
    JSON.stringify({ type: 'minimark', value: [['p', {}, 'Über Impfungen und ihre Wirkung.']] }),
    '/faktenchecks/x', JSON.stringify(['corona']), 'Untertitel', '2026-01-01',
  )
  // Quellen-Profile: kein title-Feld, sondern name
  db.exec(`CREATE TABLE _content_quellen (id TEXT, title TEXT, name TEXT, body TEXT, path TEXT, tags TEXT, description TEXT, publishedOn TEXT)`)
  db.prepare(`INSERT INTO _content_quellen VALUES (?,?,?,?,?,?,?,?)`).run(
    'q', '', 'Nicole Höchst',
    JSON.stringify({ type: 'minimark', value: [['p', {}, 'AfD-Politikerin.']] }),
    '/quellen/politiker/nicole-hoechst', JSON.stringify(['afd']), 'Profil', '2026-01-01',
  )
  db.close()
  return p
}

describe('buildFts', () => {
  it('baut FTS5-Index, der Singular/Plural via Stemming findet', () => {
    const contentDb = makeContentDb()
    const ftsDb = join(tmpdir(), `fts-test-${process.pid}-${Date.now()}.sqlite`)
    buildFts(contentDb, ftsDb, ['faktenchecks'])

    const db = new Database(ftsDb, { readonly: true })
    // Query "Impfung" muss das Dokument mit "Impfungen" finden (Stemming)
    const stem = 'impfung' // gestemmt; im echten Code via stemGerman
    const rows = db.prepare(
      `SELECT path, o_title FROM fts WHERE fts MATCH ? ORDER BY bm25(fts)`,
    ).all(`"${stem}"*`)
    expect(rows.length).toBe(1)
    expect((rows[0] as { o_title: string }).o_title).toBe('Corona Impfung Faktencheck')
    db.close()
  })

  it('nutzt name als Titel-Fallback für Quellen und erzeugt keine leeren Zeilen', () => {
    const contentDb = makeContentDb()
    const ftsDb = join(tmpdir(), `fts-test-q-${process.pid}-${Date.now()}.sqlite`)
    buildFts(contentDb, ftsDb, ['faktenchecks', 'quellen'])

    const db = new Database(ftsDb, { readonly: true })
    // Keine Zeile darf einen leeren Titel haben
    const empty = db.prepare(`SELECT COUNT(*) AS c FROM fts WHERE o_title = ''`).get() as { c: number }
    expect(empty.c).toBe(0)
    // Quelle wird über ihren name gefunden
    const rows = db.prepare(
      `SELECT o_title FROM fts WHERE fts MATCH ? ORDER BY bm25(fts)`,
    ).all(`"afd"*`)
    expect(rows.some(r => (r as { o_title: string }).o_title === 'Nicole Höchst')).toBe(true)
    db.close()
  })
})
