import { resolve, relative, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { CollectionName, TagStatus } from '~/types/dev-review'

const websiteRoot = resolve(fileURLToPath(import.meta.url), '../../..')
const contentRoot = resolve(websiteRoot, 'content')

export function validateContentPath(input: unknown): string {
  if (typeof input !== 'string' || !input) {
    throw createError({ statusCode: 400, statusMessage: 'path is required' })
  }
  if (isAbsolute(input) || input.includes('..')) {
    throw createError({ statusCode: 400, statusMessage: 'invalid path' })
  }
  const abs = resolve(contentRoot, input)
  const rel = relative(contentRoot, abs)
  if (rel.startsWith('..') || isAbsolute(rel)) {
    throw createError({ statusCode: 400, statusMessage: 'path escapes content/' })
  }
  return abs
}

export function getWebsiteRoot(): string {
  return websiteRoot
}

export function getContentRoot(): string {
  return contentRoot
}

export function tagStatusFromTags(tags: Iterable<string> | null | undefined): TagStatus {
  if (!tags) return 'clean'
  const arr = Array.from(tags)
  if (arr.includes('more-research-needed')) return 'needs-research'
  if (arr.includes('research-done-review-pending')) return 'review-pending'
  return 'clean'
}

export function collectionFromPath(path: string): CollectionName | null {
  if (path.startsWith('faktenchecks/')) return 'faktenchecks'
  if (path.startsWith('lagerfeuer/')) return 'lagerfeuer'
  if (path.startsWith('glossar/')) return 'glossar'
  if (path.startsWith('quellen/')) {
    if (/^quellen\/[^/]+\/[^/]+\/links\//.test(path)) return 'quellenlinks'
    if (/^quellen\/[^/]+\/[^/]+\/zitate\//.test(path)) return 'zitate'
    return 'quellen'
  }
  return null
}
