import { readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { getWebsiteRoot } from '~~/server/utils/dev-review'

export interface AuditPair {
  key: string
  before: string | null
  after: string | null
}

export default defineEventHandler(async (): Promise<AuditPair[]> => {
  const dir = resolve(getWebsiteRoot(), '..', 'docs', 'impeccable-audit-screenshots')
  let files: string[] = []
  try {
    files = await readdir(dir)
  } catch {
    return []
  }

  const pairs = new Map<string, AuditPair>()
  for (const file of files) {
    if (!/\.(png|jpe?g|webp)$/i.test(file)) continue
    const m = file.match(/^(before|after)-(.+)\.(png|jpe?g|webp)$/i)
    if (!m) continue
    const variant = m[1]!.toLowerCase() as 'before' | 'after'
    const key = m[2]!
    if (!pairs.has(key)) pairs.set(key, { key, before: null, after: null })
    pairs.get(key)![variant] = file
  }

  return Array.from(pairs.values()).sort((a, b) => a.key.localeCompare(b.key))
})
