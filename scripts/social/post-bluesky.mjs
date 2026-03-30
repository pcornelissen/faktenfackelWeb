#!/usr/bin/env node
/**
 * Bluesky-Post via AT Protocol API.
 *
 * Usage:
 *   node scripts/social/post-bluesky.mjs "Post-Text"
 *   node scripts/social/post-bluesky.mjs "Post-Text" --image path/to/image.png
 *
 * Env: BLUESKY_HANDLE, BLUESKY_APP_PASSWORD
 */

import { readFile } from 'node:fs/promises'
import { extname } from 'node:path'

const args = process.argv.slice(2)
const imageIdx = args.indexOf('--image')
let imagePath = null
if (imageIdx !== -1) {
  imagePath = args[imageIdx + 1]
  args.splice(imageIdx, 2)
}
const text = args[0]

if (!text) {
  console.error('Usage: node scripts/social/post-bluesky.mjs "Text" [--image path]')
  process.exit(1)
}

const handle = process.env.BLUESKY_HANDLE || 'faktenfackel.bsky.social'
const password = process.env.BLUESKY_APP_PASSWORD
if (!password) {
  console.error('BLUESKY_APP_PASSWORD nicht gesetzt.')
  process.exit(1)
}

// Login
const session = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identifier: handle, password }),
}).then(r => r.json())

if (session.error) {
  console.error(`Login fehlgeschlagen: ${session.error}`)
  process.exit(1)
}

const authHeader = { Authorization: `Bearer ${session.accessJwt}` }

// Bild hochladen (optional)
let imageEmbed = undefined
if (imagePath) {
  const imageData = await readFile(imagePath)
  const mimeTypes = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }
  const mime = mimeTypes[extname(imagePath).toLowerCase()] || 'image/png'

  const uploadRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.uploadBlob', {
    method: 'POST',
    headers: { ...authHeader, 'Content-Type': mime },
    body: imageData,
  }).then(r => r.json())

  if (uploadRes.error) {
    console.error(`Bild-Upload fehlgeschlagen: ${uploadRes.error}`)
    process.exit(1)
  }

  imageEmbed = {
    $type: 'app.bsky.embed.images',
    images: [{ alt: '', image: uploadRes.blob }],
  }
}

// URLs im Text als Facets (Link-Cards)
const urlRegex = /(https?:\/\/[^\s]+)/g
const facets = []
let match
while ((match = urlRegex.exec(text)) !== null) {
  const url = match[1]
  const encoder = new TextEncoder()
  facets.push({
    index: {
      byteStart: encoder.encode(text.substring(0, match.index)).length,
      byteEnd: encoder.encode(text.substring(0, match.index + url.length)).length,
    },
    features: [{ $type: 'app.bsky.richtext.facet#link', uri: url }],
  })
}

// Post erstellen
const record = {
  $type: 'app.bsky.feed.post',
  text,
  langs: ['de'],
  createdAt: new Date().toISOString(),
}
if (facets.length > 0) record.facets = facets
if (imageEmbed) record.embed = imageEmbed

const post = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
  method: 'POST',
  headers: { ...authHeader, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    repo: session.did,
    collection: 'app.bsky.feed.post',
    record,
  }),
}).then(r => r.json())

if (post.error) {
  console.error(`Post fehlgeschlagen: ${post.error}`)
  process.exit(1)
}

const postId = post.uri.split('/').pop()
console.log(`Bluesky: https://bsky.app/profile/${handle}/post/${postId}`)
