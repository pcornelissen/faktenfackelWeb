// Auf dev-Instanzen (NUXT_PUBLIC_SITE_ENV=dev) alle Antworten mit noindex ausliefern,
// damit Suchmaschinen den Preview-Container nicht indexieren.
export default defineEventHandler((event) => {
  if (String(useRuntimeConfig(event).public.siteEnv ?? '') === 'dev') {
    setResponseHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
  }
})
