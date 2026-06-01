type MinimarkNode = [string, Record<string, unknown>, ...unknown[]]
interface Minimark { type?: string, value?: unknown[] }

export interface Section {
  path: string
  title: string
  breadcrumb: string
  content: string
}

const HEADING = /^h([1-6])$/

export function minimarkToText(node: unknown): string {
  if (typeof node === 'string') return node
  if (!Array.isArray(node)) return ''
  // node = [tag, attrs, ...children]
  const parts: string[] = []
  for (let i = 2; i < node.length; i++) parts.push(minimarkToText(node[i]))
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

export function extractSections(
  body: Minimark | null | undefined,
  meta: { path: string, title: string },
): Section[] {
  const value = body?.value
  if (!Array.isArray(value)) return []

  const sections: Section[] = []
  let current: Section = { path: meta.path, title: meta.title, breadcrumb: '', content: '' }

  for (const node of value) {
    if (Array.isArray(node) && typeof node[0] === 'string' && HEADING.test(node[0])) {
      if (current.content.trim() || sections.length === 0) sections.push(current)
      const headingText = minimarkToText(node as MinimarkNode)
      current = { path: meta.path, title: headingText, breadcrumb: meta.title, content: '' }
    } else {
      const text = minimarkToText(node)
      if (text) current.content += (current.content ? ' ' : '') + text
    }
  }
  sections.push(current)

  // Dedupe leere Folgesektionen, erste Sektion (Seitentitel) immer behalten.
  return sections.filter((s, i) => i === 0 || s.content.trim().length > 0)
}
