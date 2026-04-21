import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { stat, readdir, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import matter from 'gray-matter'
import {
  collectionFromPath,
  getContentRoot,
  getWebsiteRoot,
  tagStatusFromTags,
} from '~~/server/utils/dev-review'
import type { GitStatus, ReviewQueueItem } from '~/types/dev-review'

const execFileAsync = promisify(execFile)

async function getGitStatusMap(): Promise<Map<string, GitStatus>> {
  const map = new Map<string, GitStatus>()
  try {
    const { stdout } = await execFileAsync('git', ['status', '--porcelain', 'content'], {
      cwd: getWebsiteRoot(),
      maxBuffer: 10 * 1024 * 1024,
    })
    for (const line of stdout.split('\n')) {
      if (!line) continue
      const x = line[0]
      const y = line[1]
      const path = line.slice(3).trim()
      if (!path.startsWith('content/')) continue
      const rel = path.slice('content/'.length)
      let status: GitStatus = 'clean'
      if (x === '?' && y === '?') status = 'untracked'
      else if (x !== ' ' && x !== '?') status = 'staged'
      else if (y !== ' ') status = 'modified'
      map.set(rel, status)
    }
  } catch {
    // git not available or not a repo — treat all as clean
  }
  return map
}

async function walk(dir: string, rel = ''): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const out: string[] = []
  for (const e of entries) {
    const abs = resolve(dir, e.name)
    const nextRel = rel ? `${rel}/${e.name}` : e.name
    if (e.isDirectory()) out.push(...await walk(abs, nextRel))
    else if (e.isFile() && e.name.endsWith('.md')) out.push(nextRel)
  }
  return out
}

export default defineEventHandler(async (): Promise<ReviewQueueItem[]> => {
  const gitMap = await getGitStatusMap()
  const contentRoot = getContentRoot()
  const files = await walk(contentRoot)
  const items: ReviewQueueItem[] = []

  for (const rel of files) {
    const collection = collectionFromPath(rel)
    if (!collection) continue
    const abs = resolve(contentRoot, rel)
    const raw = await readFile(abs, 'utf8')
    let fm: Record<string, unknown> = {}
    try {
      fm = matter(raw).data as Record<string, unknown>
    } catch {
      continue
    }
    const tagsRaw = fm.tags
    const tags: string[] = Array.isArray(tagsRaw)
      ? tagsRaw as string[]
      : (tagsRaw instanceof Set ? Array.from(tagsRaw as Set<string>) : [])
    const title = (fm.title as string) ?? (fm.name as string) ?? rel
    const code = (fm.code as string) ?? null
    const mtimeIso = (await stat(abs)).mtime.toISOString()

    items.push({
      code,
      title,
      collection,
      path: rel,
      tagStatus: tagStatusFromTags(tags),
      gitStatus: gitMap.get(rel) ?? 'clean',
      mtime: mtimeIso,
    })
  }

  items.sort((a, b) => (a.mtime < b.mtime ? 1 : -1))
  return items
})
