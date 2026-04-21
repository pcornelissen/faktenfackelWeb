export default defineEventHandler((event) => {
  if (process.env.NODE_ENV !== 'production') return
  const url = event.node.req.url ?? ''
  if (url.startsWith('/dev/') || url.startsWith('/api/dev/')) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }
})
