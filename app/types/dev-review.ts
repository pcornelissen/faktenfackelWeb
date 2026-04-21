export type TagStatus = 'needs-research' | 'review-pending' | 'clean'
export type GitStatus = 'untracked' | 'modified' | 'staged' | 'clean'

export type CollectionName
  = 'faktenchecks'
    | 'lagerfeuer'
    | 'glossar'
    | 'zitate'
    | 'quellen'
    | 'quellenlinks'

export interface ReviewQueueItem {
  code: string | null
  title: string
  collection: CollectionName
  path: string
  tagStatus: TagStatus
  gitStatus: GitStatus
  mtime: string
}

export interface FileDetail {
  path: string
  frontmatter: Record<string, unknown>
  body: string
  diff: string | null
}
