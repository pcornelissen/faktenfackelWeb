<script setup lang="ts">
import { navItems } from '~/utils/navigation'

const route = useRoute()
const path = computed(() => route.path === '' ? '/' : route.path)

const items = computed(() => {
  const base = [...navItems]
  if (import.meta.dev) base.push({ name: 'Review', href: '/dev/review', label: 'Dev: Artikel-Review' })
  return base
})

function isActive(href: string) {
  return (href !== '/' && path.value.startsWith(href)) || (path.value === '/' && href === '/')
}
</script>

<template>
  <nav class="menu">
    <ul>
      <li
        v-for="item in items"
        :key="item.name"
        :class="{ 'menu-dev': item.href.startsWith('/dev') }"
      >
        <a
          :href="item.href"
          :class="{ 'item-active': isActive(item.href) }"
          :title="item.label || `Weiter zu ${item.name}`"
        >
          {{ item.name }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.menu ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 0;
}

.menu li {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  display: block;
  border-left: 1px solid #2D2822;
}

.menu li:last-child {
  border-right: 1px solid #2D2822;
}

.menu a {
  display: block;
  padding: 0 0.9rem;
  height: 60px;
  line-height: 60px;
  color: #C4BAB0;
  text-decoration: none;
  transition: color 0.2s, background 0.2s;
  white-space: nowrap;
}

.menu a:hover {
  color: var(--flame);
  background: rgba(232, 68, 10, 0.08);
}

.item-active {
  color: var(--flame) !important;
  background: rgba(232, 68, 10, 0.1);
}

.menu-dev a {
  color: var(--flame);
  font-weight: 700;
}
.menu-dev a::before {
  content: 'DEV · ';
  opacity: 0.55;
  font-weight: 400;
}

@media screen and (max-width: 1100px) {
  .menu li {
    font-size: 0.65rem;
  }
  .menu a {
    padding: 0 0.6rem;
  }
}

@media screen and (max-width: 850px) {
  .menu {
    display: none;
  }
}
</style>
