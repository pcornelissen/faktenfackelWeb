import { readFile, rename, writeFile } from 'node:fs/promises'
import matter from 'gray-matter'
import { tagStatusFromTags, validateContentPath } from '~~/server/utils/dev-review'
import type { TagStatus } from '~/types/dev-review'

const TAG_TO_REMOVE = 'research-done-review-pending'

interface TargetedRemoval {
  text: string
  removed: boolean
}

/**
 * Targeted textual removal of TAG_TO_REMOVE from the frontmatter `tags:` block.
 * Preserves all other frontmatter formatting — essential because gray-matter.stringify
 * re-serialises dates as ISO timestamps, which would cause unwanted diffs on every toggle.
 */
function removeTagLine(raw: string): TargetedRemoval {
  const fmOpen = raw.match(/^---\r?\n/)
  if (!fmOpen) return { text: raw, removed: false }
  const afterOpen = fmOpen[0].length
  const rest = raw.slice(afterOpen)
  const fmCloseIdx = rest.search(/\r?\n---(\r?\n|$)/)
  if (fmCloseIdx === -1) return { text: raw, removed: false }
  const fmBlock = rest.slice(0, fmCloseIdx)
  const fmCloseMatch = rest.slice(fmCloseIdx).match(/^\r?\n---(\r?\n|$)/)!
  const fmStartRaw = raw.slice(0, afterOpen)
  const fmEndRaw = raw.slice(afterOpen + fmCloseIdx, afterOpen + fmCloseIdx + fmCloseMatch[0].length)
  const afterFm = raw.slice(afterOpen + fmCloseIdx + fmCloseMatch[0].length)

  // Block style: `tags:\n  - item\n  - item`
  const blockRe = /(^|\r?\n)tags:[ \t]*(\r?\n)([ \t]*-[^\n]*(?:\r?\n[ \t]*-[^\n]*)*)/
  const blockMatch = fmBlock.match(blockRe)
  if (blockMatch) {
    const leading = blockMatch[1] ?? ''
    const afterKeyNl = blockMatch[2] ?? '\n'
    const items = blockMatch[3] ?? ''
    const itemLines = items.split(/\r?\n/)
    const kept: string[] = []
    let removed = false
    for (const line of itemLines) {
      const m = line.match(/^([ \t]*)-[ \t]*(.*)$/)
      if (m && (m[2] ?? '').trim().replace(/^['"]|['"]$/g, '') === TAG_TO_REMOVE) {
        removed = true
        continue
      }
      kept.push(line)
    }
    if (removed) {
      let replacement: string
      if (kept.length === 0) {
        replacement = leading === '' ? '' : leading.replace(/\r?\n$/, '')
      } else {
        replacement = `${leading}tags:${afterKeyNl}${kept.join('\n')}`
      }
      const fixedFm = fmBlock.replace(blockMatch[0], replacement)
      return { text: fmStartRaw + fixedFm + fmEndRaw + afterFm, removed: true }
    }
  }

  // Flow style: `tags: [a, b, ...]`
  const flowRe = /(^|\r?\n)tags:[ \t]*\[([^\]\n]*)\]([ \t]*)/
  const flowMatch = fmBlock.match(flowRe)
  if (flowMatch) {
    const items = (flowMatch[2] ?? '').split(',').map(s => s.trim()).filter(s => s.length > 0)
    let removed = false
    const kept = items.filter((s) => {
      const bare = s.replace(/^['"]|['"]$/g, '')
      if (bare === TAG_TO_REMOVE) {
        removed = true
        return false
      }
      return true
    })
    if (removed) {
      const newFlow = `${flowMatch[1] ?? ''}tags: [${kept.join(', ')}]${flowMatch[3] ?? ''}`
      const fixedFm = fmBlock.replace(flowMatch[0], newFlow)
      return { text: fmStartRaw + fixedFm + fmEndRaw + afterFm, removed: true }
    }
  }

  return { text: raw, removed: false }
}

export default defineEventHandler(async (event): Promise<{ tagStatus: TagStatus, removed: boolean }> => {
  const body = await readBody<{ path?: unknown }>(event)
  const abs = validateContentPath(body?.path)

  const raw = await readFile(abs, 'utf8').catch(() => {
    throw createError({ statusCode: 404, statusMessage: 'file not found' })
  })

  const parsed = matter(raw)
  const currentTagsRaw = (parsed.data as Record<string, unknown>).tags
  const currentTags: string[] = Array.isArray(currentTagsRaw)
    ? currentTagsRaw as string[]
    : (currentTagsRaw instanceof Set ? Array.from(currentTagsRaw as Set<string>) : [])

  if (!currentTags.includes(TAG_TO_REMOVE)) {
    return { tagStatus: tagStatusFromTags(currentTags), removed: false }
  }

  const { text, removed } = removeTagLine(raw)
  if (!removed) {
    throw createError({ statusCode: 500, statusMessage: 'could not locate tag in frontmatter' })
  }

  const tmp = `${abs}.${process.pid}.tmp`
  await writeFile(tmp, text, 'utf8')
  await rename(tmp, abs)

  const nextTags = currentTags.filter(t => t !== TAG_TO_REMOVE)
  return { tagStatus: tagStatusFromTags(nextTags), removed: true }
})
