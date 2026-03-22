<script setup lang="ts">
function pillarImgName(iconPath: string) {
  return iconPath.replace('/img/categories/', '').replace('.png', '')
}

const pillars = [
  {
    icon: '/img/categories/fake-news.png',
    label: 'Bereich',
    title: 'Faktenchecks',
    desc: 'Geprüfte Behauptungen mit Quellen und klarem Urteil.',
    href: '/faktenchecks',
    cta: 'Alle Faktenchecks',
  },
  {
    icon: '/img/categories/bonfire.png',
    label: 'Bereich',
    title: 'Lagerfeuer',
    desc: 'Blogeinträge, vertiefende Hintergrundartikel und Analysen.',
    href: '/lagerfeuer',
    cta: 'Zum Lagerfeuer',
  },
  {
    icon: '/img/categories/blogging.png',
    label: 'Bereich',
    title: 'Quellen',
    desc: 'Kuratierte Quellensammlung für eigene Recherchen.',
    href: '/quellen',
    cta: 'Quellen entdecken',
  },
  {
    icon: '/img/categories/feedback.png',
    label: 'Bereich',
    title: 'Zitate',
    desc: 'Überprüfte Aussagen von Personen des öffentlichen Lebens.',
    href: '/zitate',
    cta: 'Zitate ansehen',
  },
]
</script>

<template>
  <div class="pillars">
    <a
      v-for="p in pillars"
      :key="p.href"
      :href="p.href"
      class="pillar"
    >
      <picture>
        <source
          type="image/webp"
          :srcset="`/img/categories/opt/${pillarImgName(p.icon)}-64.webp 64w, /img/categories/opt/${pillarImgName(p.icon)}-128.webp 128w`"
          sizes="52px"
        >
        <img
          :src="p.icon"
          :alt="p.title"
          width="52"
          height="52"
          class="pillar-icon"
        >
      </picture>
      <div class="pillar-title">
        {{ p.title }}
      </div>
      <div class="pillar-label">
        {{ p.label }}
      </div>
      <p class="pillar-desc">
        {{ p.desc }}
      </p>
      <div class="pillar-cta">
        <UIcon
          name="mdi:arrow-right"
          class="size-4"
        />{{ p.cta }}
      </div>
    </a>
  </div>
</template>

<style scoped>
.pillars {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  border: 1px solid var(--fackel-border);
  border-radius: 6px;
  overflow: hidden;
  margin: 2.5rem 0;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.pillar {
  padding: 1.8rem 1.4rem;
  border-right: 1px solid var(--fackel-border);
  text-decoration: none;
  color: inherit;
  position: relative;
  transition: background 0.2s;
  background: white;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pillar:last-child { border-right: none; }
.pillar:hover { background: #FDFAF5; }

.pillar::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--flame);
  transform: scaleX(0);
  transition: transform 0.25s;
  transform-origin: left;
}

.pillar:hover::before { transform: scaleX(1); }

.pillar picture { display: block; align-self: center; margin-bottom: 0.3rem; line-height: 0; }
.pillar-icon { width: 52px; height: 52px; object-fit: contain; }

.pillar-label {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--flame);
  font-weight: 600;
  margin-top: -0.3rem;
}

.pillar-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.2;
  margin: 0;
}

.pillar-desc {
  font-size: 0.88rem;
  color: var(--muted);
  line-height: 1.5;
  font-weight: 300;
  margin: 0;
}

.pillar-cta {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  color: var(--muted);
  margin-top: auto;
  padding-top: 0.8rem;
  border-top: 1px solid var(--fackel-border);
  display: flex;
  align-items: center;
  gap: 6px;
}

.pillar-cta :deep(span) {
  color: var(--flame);
  flex-shrink: 0;
}

@media screen and (max-width: 1000px) {
  .pillars { grid-template-columns: repeat(2, 1fr); }
  .pillar { border-bottom: 1px solid var(--fackel-border); }
  .pillar:nth-child(2) { border-right: none; }
  .pillar:nth-child(3), .pillar:nth-child(4) { border-bottom: none; }
  .pillar:nth-child(3) { border-right: 1px solid var(--fackel-border); }
}

@media screen and (max-width: 560px) {
  .pillars { grid-template-columns: 1fr; }
  .pillar { border-right: none; border-bottom: 1px solid var(--fackel-border); }
  .pillar:last-child { border-bottom: none; }
}
</style>
