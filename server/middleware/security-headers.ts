// CSP + Permissions-Policy live in nuxt.config routeRules ('/**') so they also
// reach prerendered pages (server middleware does not run for static output).
export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  })
})
