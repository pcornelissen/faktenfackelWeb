#!/usr/bin/env node
/**
 * Facebook Page-Post via Graph API.
 *
 * Usage:
 *   node scripts/social/post-facebook.mjs "Post-Text"
 *   node scripts/social/post-facebook.mjs "Post-Text" --image path/to/image.png
 *   node scripts/social/post-facebook.mjs "Post-Text" --image ... --article-url https://faktenfackel.de/...
 *
 * Das --article-url-Flag setzt den Link als ersten Kommentar unter den Post,
 * damit Facebook keine externen Links im Post-Text abstraft.
 *
 * Env: FACEBOOK_PAGE_ID, FACEBOOK_PAGE_TOKEN
 */

import { readFile } from 'node:fs/promises'
import { basename } from 'node:path'

const args = process.argv.slice(2)

function takeFlag(name) {
  const idx = args.indexOf(name)
  if (idx === -1) return null
  const val = args[idx + 1]
  args.splice(idx, 2)
  return val
}

const imagePath = takeFlag('--image')
const articleUrl = takeFlag('--article-url')
const text = args[0]

if (!text) {
  console.error('Usage: node scripts/social/post-facebook.mjs "Text" [--image path] [--article-url url]')
  process.exit(1)
}

const pageId = process.env.FACEBOOK_PAGE_ID
const pageToken = process.env.FACEBOOK_PAGE_TOKEN
if (!pageId || !pageToken) {
  console.error('FACEBOOK_PAGE_ID und FACEBOOK_PAGE_TOKEN müssen gesetzt sein.')
  process.exit(1)
}

const graphUrl = `https://graph.facebook.com/v19.0/${pageId}`

let postId = null

if (imagePath) {
  const imageData = await readFile(imagePath)
  const form = new FormData()
  form.append('source', new Blob([imageData]), basename(imagePath))
  form.append('message', text)
  form.append('access_token', pageToken)

  const response = await fetch(`${graphUrl}/photos`, { method: 'POST', body: form })
  if (!response.ok) {
    console.error(`Post fehlgeschlagen: ${response.status} ${await response.text()}`)
    process.exit(1)
  }
  const result = await response.json()
  postId = result.post_id || result.id
  console.log(`Facebook: https://www.facebook.com/${postId}`)
} else {
  const response = await fetch(`${graphUrl}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text, access_token: pageToken }),
  })
  if (!response.ok) {
    console.error(`Post fehlgeschlagen: ${response.status} ${await response.text()}`)
    process.exit(1)
  }
  const result = await response.json()
  postId = result.id
  console.log(`Facebook: https://www.facebook.com/${postId}`)
}

// Ersten Kommentar mit Artikel-Link anhaengen
if (articleUrl && postId) {
  const commentRes = await fetch(`https://graph.facebook.com/v19.0/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: articleUrl, access_token: pageToken }),
  })
  if (!commentRes.ok) {
    console.error(`Kommentar fehlgeschlagen: ${commentRes.status} ${await commentRes.text()}`)
    // Nicht fatal, Post selbst war erfolgreich
  } else {
    const c = await commentRes.json()
    console.log(`Kommentar: https://www.facebook.com/${c.id}`)
  }
}
