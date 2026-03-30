#!/usr/bin/env node
/**
 * Facebook Page-Post via Graph API.
 *
 * Usage:
 *   node scripts/social/post-facebook.mjs "Post-Text"
 *   node scripts/social/post-facebook.mjs "Post-Text" --image path/to/image.png
 *
 * Env: FACEBOOK_PAGE_ID, FACEBOOK_PAGE_TOKEN
 *
 * Setup:
 * 1. Facebook App erstellen: https://developers.facebook.com/apps/
 * 2. Page Access Token generieren (Graph API Explorer)
 * 3. App Review für pages_manage_posts Permission
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
  console.error('Usage: node scripts/social/post-facebook.mjs "Text" [--image path]')
  process.exit(1)
}

const pageId = process.env.FACEBOOK_PAGE_ID
const pageToken = process.env.FACEBOOK_PAGE_TOKEN
if (!pageId || !pageToken) {
  console.error('FACEBOOK_PAGE_ID und FACEBOOK_PAGE_TOKEN müssen gesetzt sein.')
  console.error('Setup: https://developers.facebook.com/tools/explorer/')
  process.exit(1)
}

const graphUrl = `https://graph.facebook.com/v19.0/${pageId}`

if (imagePath) {
  // Photo Post (Bild + Text)
  const imageData = await readFile(imagePath)
  const form = new FormData()
  form.append('source', new Blob([imageData]), basename(imagePath))
  form.append('message', text)
  form.append('access_token', pageToken)

  const response = await fetch(`${graphUrl}/photos`, {
    method: 'POST',
    body: form,
  })

  if (!response.ok) {
    const error = await response.text()
    console.error(`Post fehlgeschlagen: ${response.status} ${error}`)
    process.exit(1)
  }

  const result = await response.json()
  console.log(`Facebook: https://www.facebook.com/${result.post_id || result.id}`)
} else {
  // Text Post (mit Link-Preview)
  const response = await fetch(`${graphUrl}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text, access_token: pageToken }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error(`Post fehlgeschlagen: ${response.status} ${error}`)
    process.exit(1)
  }

  const result = await response.json()
  console.log(`Facebook: https://www.facebook.com/${result.id}`)
}
