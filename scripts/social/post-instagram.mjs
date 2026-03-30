#!/usr/bin/env node
/**
 * Instagram Post via Graph API (Content Publishing).
 *
 * Usage: node scripts/social/post-instagram.mjs "Caption" --image path/to/image.png
 *
 * Env: FACEBOOK_PAGE_TOKEN (gleicher Token), INSTAGRAM_USER_ID
 *
 * Setup:
 * 1. Instagram Business-Konto mit Facebook Page verknüpfen
 * 2. Facebook App mit instagram_basic + instagram_content_publish Permissions
 * 3. App Review bestehen
 * 4. Instagram User ID ermitteln:
 *    GET /me/accounts?fields=instagram_business_account{id} mit Page Token
 */

console.error('Instagram-Posting ist vorbereitet, aber noch nicht implementiert.')
console.error('')
console.error('Setup-Schritte:')
console.error('1. Instagram Business-Konto erstellen und mit Facebook Page verknüpfen')
console.error('2. Facebook App mit instagram_basic + instagram_content_publish Permissions')
console.error('3. App Review bestehen')
console.error('4. INSTAGRAM_USER_ID und FACEBOOK_PAGE_TOKEN in .env.local setzen')
console.error('')
console.error('Manuell posten: https://www.instagram.com/')
process.exit(1)
