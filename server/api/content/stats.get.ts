import { defineEventHandler, setHeader } from 'h3'
import { queryCollection } from '@nuxt/content/server'

// Mirrors the exact count queries from app/components/layout/HeroSection.vue:
//   faktenchecks: .where('path','NOT LIKE','%_info%').count()
//   lagerfeuer:   .where('path','NOT LIKE','%_info%').count()
//   quellenlinks: .count()
//   quellen:      .count()
export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800')

  const [faktenchecks, lagerfeuer, quellenlinks, quellen] = await Promise.all([
    queryCollection(event, 'faktenchecks' as never).where('path', 'NOT LIKE', '%_info%').count(),
    queryCollection(event, 'lagerfeuer' as never).where('path', 'NOT LIKE', '%_info%').count(),
    queryCollection(event, 'quellenlinks' as never).count(),
    queryCollection(event, 'quellen' as never).count(),
  ])

  return { faktenchecks, lagerfeuer, quellenlinks, quellen }
})
