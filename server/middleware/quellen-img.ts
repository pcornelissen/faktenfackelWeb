// Dev-only: serves source images from content/quellen/ at /quellen-img/
// In production (Cloudflare Workers), nitro.publicAssets handles this.
// import.meta.dev guard ensures this is tree-shaken from the CF build.
export default defineEventHandler(async (event) => {
  if (!import.meta.dev) return

  const url = getRequestURL(event).pathname
  if (!url.startsWith('/quellen-img/')) return

  const relativePath = url.slice('/quellen-img/'.length)
  // Basic path-traversal guard
  if (!relativePath || relativePath.includes('..')) return

  const { readFile } = await import('node:fs/promises')
  const { resolve, extname } = await import('node:path')

  const fullPath = resolve(process.cwd(), 'content/quellen', relativePath)

  try {
    const data = await readFile(fullPath)
    const ext = extname(relativePath).toLowerCase()
    const contentType
      = ext === '.webp'
        ? 'image/webp'
        : ext === '.jpg' || ext === '.jpeg'
          ? 'image/jpeg'
          : ext === '.png'
            ? 'image/png'
            : ext === '.svg'
              ? 'image/svg+xml'
              : 'application/octet-stream'

    setResponseHeader(event, 'Content-Type', contentType)
    setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')
    return data
  } catch {
    return
  }
})
