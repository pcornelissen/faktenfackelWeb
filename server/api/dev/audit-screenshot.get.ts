import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import { getWebsiteRoot } from '~~/server/utils/dev-review'

const MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
}

export default defineEventHandler(async (event) => {
  const file = String(getQuery(event).file ?? '')
  if (!/^[a-z0-9._-]+\.(png|jpe?g|webp)$/i.test(file)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid file' })
  }

  const dir = resolve(getWebsiteRoot(), '..', 'docs', 'impeccable-audit-screenshots')
  const abs = resolve(dir, file)
  if (!abs.startsWith(dir + '/')) {
    throw createError({ statusCode: 400, statusMessage: 'path escapes dir' })
  }

  let info
  try {
    info = await stat(abs)
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'not found' })
  }

  const ext = file.split('.').pop()!.toLowerCase()
  setHeader(event, 'Content-Type', MIME[ext] ?? 'application/octet-stream')
  setHeader(event, 'Content-Length', info.size)
  setHeader(event, 'Cache-Control', 'no-store')
  return sendStream(event, createReadStream(abs))
})
