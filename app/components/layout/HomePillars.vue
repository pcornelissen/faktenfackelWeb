<script setup lang="ts">
function pillarImgName(iconPath: string) {
  return iconPath.replace('/img/categories/', '').replace('.png', '')
}

const pillars = [
  {
    icon: '/img/categories/fake-news.png',
    label: 'Kernbereich',
    title: 'Faktenchecks',
    desc: 'Der wichtigste Einstieg: überprüfte Behauptungen mit klarer Einordnung und offen nachvollziehbaren Quellen.',
    href: '/faktenchecks',
    cta: 'Alle Faktenchecks',
  },
  {
    icon: '/img/categories/bonfire.png',
    label: 'Einordnung',
    title: 'Lagerfeuer',
    desc: 'Hintergrund, Kontext und längere Analysen als zweiter Pfad für Leser, die tiefer einsteigen wollen.',
    href: '/lagerfeuer',
    cta: 'Zum Lagerfeuer',
  },
  {
    icon: '/img/categories/blogging.png',
    label: 'Transparenz',
    title: 'Quellen & Zitate',
    desc: 'Die Wissensbasis bleibt sichtbar, tritt aber stärker als Vertrauensebene statt als zusätzlicher Hauptstrom auf.',
    href: '/quellen',
    cta: 'Quellenbasis ansehen',
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
          loading="lazy"
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
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin: 2.5rem 0 3rem;
}

.pillar {
  padding: 1.6rem 1.5rem;
  text-decoration: none;
  color: inherit;
  position: relative;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
  background: white;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  border: 1px solid var(--fackel-border);
  border-radius: 1.1rem;
  box-shadow: 0 10px 26px rgba(31, 22, 15, 0.04);
}

.pillar:hover {
  transform: translateY(-2px);
  border-color: #E6C6A7;
  box-shadow: 0 16px 36px rgba(31, 22, 15, 0.08);
}

.pillar::before {
  content: '';
  position: absolute;
  top: 0.85rem;
  left: 1.5rem;
  width: 2rem;
  height: 2px;
  background: var(--flame);
  opacity: 0.8;
}

.pillar picture {
  display: block;
  align-self: flex-start;
  margin-top: 0.85rem;
  margin-bottom: 0.1rem;
  line-height: 0;
}

.pillar-icon { width: 44px; height: 44px; object-fit: contain; }

.pillar-label {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.74rem;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  color: var(--flame);
  font-weight: 600;
  margin-top: 0.1rem;
}

.pillar-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.05;
  margin: 0;
}

.pillar-desc {
  font-size: 1rem;
  color: var(--muted);
  line-height: 1.55;
  font-weight: 400;
  margin: 0;
}

.pillar-cta {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.78rem;
  color: var(--ember);
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--fackel-border);
  display: flex;
  align-items: center;
  gap: 6px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 600;
}

.pillar-cta :deep(span) {
  color: var(--flame);
  flex-shrink: 0;
}

@media screen and (max-width: 1000px) {
  .pillars { grid-template-columns: 1fr; }
}

@media screen and (max-width: 560px) {
  .pillars {
    margin-top: 2rem;
    margin-bottom: 2.4rem;
  }
  .pillar {
    padding: 1.35rem 1.2rem;
  }
  .pillar-title {
    font-size: 1.4rem;
  }
}
</style>
