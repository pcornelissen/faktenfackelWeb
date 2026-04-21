import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFile } from 'node:fs/promises'
import matter from 'gray-matter'
import { getWebsiteRoot, validateContentPath } from '~~/server/utils/dev-review'
import type { FileDetail } from '~/types/dev-review'

const execFileAsync = promisify(execFile)

async function gitDiff(relPath: string, staged: boolean): Promise<string> {
  const args = staged
    ? ['diff', '--cached', '--', `content/${relPath}`]
    : ['diff', '--', `content/${relPath}`]
  try {
    const { stdout } = await execFileAsync('git', args, {
      cwd: getWebsiteRoot(),
      maxBuffer: 10 * 1024 * 1024,
    })
    return stdout
  } catch {
    return ''
  }
}

async function gitStatusFor(relPath: string): Promise<{ isModified: boolean, isStaged: boolean, isUntracked: boolean }> {
  try {
    const { stdout } = await execFileAsync('git', ['status', '--porcelain', `content/${relPath}`], {
      cwd: getWebsiteRoot(),
    })
    const line = stdout.split('\n')[0] ?? ''
    if (!line) return { isModified: false, isStaged: false, isUntracked: false }
    const x = line[0]
    const y = line[1]
    return {
      isUntracked: x === '?' && y === '?',
      isStaged: x !== ' ' && x !== '?',
      isModified: y !== ' ' && !(x === '?' && y === '?'),
    }
  } catch {
    return { isModified: false, isStaged: false, isUntracked: false }
  }
}

export default defineEventHandler(async (event): Promise<FileDetail> => {
  const query = getQuery(event)
  const abs = validateContentPath(query.path)
  const rel = String(query.path)

  const raw = await readFile(abs, 'utf8').catch(() => {
    throw createError({ statusCode: 404, statusMessage: 'file not found' })
  })
  const parsed = matter(raw)
  const status = await gitStatusFor(rel)

  let diff: string | null = null
  if (status.isStaged) diff = await gitDiff(rel, true)
  else if (status.isModified) diff = await gitDiff(rel, false)

  return {
    path: rel,
    frontmatter: parsed.data as Record<string, unknown>,
    body: parsed.content,
    diff: diff && diff.trim() ? diff : null,
  }
})
