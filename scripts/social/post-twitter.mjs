#!/usr/bin/env node
/**
 * X/Twitter-Post via API v2 (Free Tier, nur Text).
 *
 * Usage: node scripts/social/post-twitter.mjs "Post-Text"
 *
 * Env: TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET
 */

import { createHmac, randomBytes } from 'node:crypto'

const text = process.argv[2]

if (!text) {
  console.error('Usage: node scripts/social/post-twitter.mjs "Text"')
  process.exit(1)
}

const apiKey = process.env.TWITTER_API_KEY
const apiSecret = process.env.TWITTER_API_SECRET
const accessToken = process.env.TWITTER_ACCESS_TOKEN
const accessSecret = process.env.TWITTER_ACCESS_SECRET

if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
  console.error('Twitter-Credentials nicht vollständig gesetzt (TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET).')
  process.exit(1)
}

// OAuth 1.0a Signatur
function generateOAuthHeader(method, url) {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const nonce = randomBytes(16).toString('hex')

  const params = {
    oauth_consumer_key: apiKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: accessToken,
    oauth_version: '1.0',
  }

  const sortedParams = Object.keys(params).sort().map(k =>
    `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`,
  ).join('&')

  const baseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`
  const signingKey = `${encodeURIComponent(apiSecret)}&${encodeURIComponent(accessSecret)}`
  const signature = createHmac('sha1', signingKey).update(baseString).digest('base64')

  params.oauth_signature = signature

  return 'OAuth ' + Object.keys(params).sort().map(k =>
    `${encodeURIComponent(k)}="${encodeURIComponent(params[k])}"`,
  ).join(', ')
}

const url = 'https://api.x.com/2/tweets'

const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Authorization': generateOAuthHeader('POST', url),
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ text }),
})

if (!response.ok) {
  const error = await response.text()
  console.error(`Post fehlgeschlagen: ${response.status} ${error}`)
  process.exit(1)
}

const result = await response.json()
console.log(`X/Twitter: https://x.com/i/status/${result.data.id}`)
