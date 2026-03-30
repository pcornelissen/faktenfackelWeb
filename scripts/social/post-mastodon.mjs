#!/usr/bin/env node
/**
 * Mastodon-Post via REST API.
 *
 * Usage:
 *   node scripts/social/post-mastodon.mjs "Post-Text"
 *   node scripts/social/post-mastodon.mjs "Post-Text" --image path/to/image.png
 *
 * Env: MASTODON_INSTANCE, MASTODON_ACCESS_TOKEN
 */

import { readFile } from 'node:fs/promises'
import { basename } from 'node:path'

const args = process.argv.slice(2)
const imageIdx = args.indexOf('--image')
let imagePath = null
if (imageIdx !== -1) {
  imagePath = args[imageIdx + 1]
  args.splice(imageIdx, 2)
}
const text = args[0]

if (!text) {
  console.error('Usage: node scripts/social/post-mastodon.mjs "Text" [--image path]')
  process.exit(1)
}

const instance = process.env.MASTODON_INSTANCE || 'https://mastodon.social'
const token = process.env.MASTODON_ACCESS_TOKEN
if (!token) {
  console.error('MASTODON_ACCESS_TOKEN nicht gesetzt.')
  process.exit(1)
}

const headers = { Authorization: `Bearer ${token}` }

// Bild hochladen (optional)
let mediaId = null
if (imagePath) {
  const imageData = await readFile(imagePath)
  const form = new FormData()
  form.append('file', new Blob([imageData]), basename(imagePath))
  form.append('description', '')

  const mediaRes = await fetch(`${instance}/api/v2/media`, {
    method: 'POST',
    headers,
    body: form,
  })

  if (!mediaRes.ok) {
    console.error(`Bild-Upload fehlgeschlagen: ${mediaRes.status} ${await mediaRes.text()}`)
    process.exit(1)
  }

  const media = await mediaRes.json()
  mediaId = media.id

  // Bei async processing warten bis fertig
  if (media.url === null) {
    let ready = false
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 1000))
      const check = await fetch(`${instance}/api/v1/media/${mediaId}`, { headers }).then(r => r.json())
      if (check.url) {
        ready = true
        break
      }
    }
    if (!ready) {
      console.error('Bild-Verarbeitung Timeout.')
      process.exit(1)
    }
  }
}

// Post erstellen
const body = {
  status: text,
  visibility: 'public',
  language: 'de',
}
if (mediaId) body.media_ids = [mediaId]

const response = await fetch(`${instance}/api/v1/statuses`, {
  method: 'POST',
  headers: { ...headers, 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

if (!response.ok) {
  console.error(`Post fehlgeschlagen: ${response.status} ${await response.text()}`)
  process.exit(1)
}

const post = await response.json()
console.log(`Mastodon: ${post.url}`)
