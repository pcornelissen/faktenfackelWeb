export default defineNuxtPlugin((nuxtApp) => {
  function labelHeadingAnchors() {
    const anchors = document.querySelectorAll<HTMLAnchorElement>(
      '.content h1 a[href^="#"], .content h2 a[href^="#"], .content h3 a[href^="#"], .content h4 a[href^="#"], .content h5 a[href^="#"]',
    )

    anchors.forEach((anchor) => {
      if (anchor.getAttribute('aria-label')) return

      const heading = anchor.closest('h1, h2, h3, h4, h5')
      const label = heading?.textContent?.trim()
      if (!label) return

      anchor.setAttribute('aria-label', `Abschnitt "${label}" verlinken`)
    })
  }

  nuxtApp.hook('page:finish', () => {
    requestAnimationFrame(labelHeadingAnchors)
  })
})
