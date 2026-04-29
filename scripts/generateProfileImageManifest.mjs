#!/usr/bin/env node
/**
 * Scans public/quellen-img/ for profile.webp files and writes a manifest
 * consumed by app/pages/quellen/[group]/sources.ts to avoid 404 requests
 * for sources without a profile image. Re-run whenever quellen-img changes.
 */
import { readdirSync, statSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const imgRoot = join(root, 'content', 'quellen')
const outFile = join(root, 'app', 'data', 'sourceProfileImages.json')

const present = []

if (existsSync(imgRoot)) {
  for (const category of readdirSync(imgRoot)) {
    const catPath = join(imgRoot, category)
    if (!statSync(catPath).isDirectory()) continue
    for (const slug of readdirSync(catPath)) {
      const slugPath = join(catPath, slug)
      if (!statSync(slugPath).isDirectory()) continue
      if (existsSync(join(slugPath, 'profile.webp'))) {
        present.push(`${category}/${slug}`)
      }
    }
  }
}

present.sort()

mkdirSync(dirname(outFile), { recursive: true })
writeFileSync(outFile, JSON.stringify(present, null, 2) + '\n')
console.log(`Wrote ${present.length} entries to ${outFile.replace(root + '/', '')}`)
