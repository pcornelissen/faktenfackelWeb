<script setup lang="ts">
const menuItems = [
  { name: 'Start', href: '/', active: false },
  { name: 'Faktenchecks', href: '/faktenchecks', active: false },
  { name: 'Glossar', href: '/glossar', active: false },
  { name: 'Änderungen', href: '/news', active: false },
  { name: 'Mehr', href: '/mehr', active: false, label: 'Weitere Webseiten' },
]
const route = useRoute()

const path = route.path == '' ? '/' : route.path
menuItems.forEach(item => item.active = path == item.href)
</script>

<template>
  <nav class="menu">
    <ul>
      <li
        v-for="item in menuItems"
        :key="item.name"
      >
        <a
          :href="item.href"
          :class="{ 'item-active': item.active }"
          :title="item.label || `Weiter zu ${item.name}`"
        >
          {{ item.name }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
  li {
    font: 16px/1.5 'Ubuntu-Mono', monospace;
    display: inline-block;
    margin-right: 1rem;
  }

  .item-active {
    color: var(--color-secondary);
    font-weight: bold;
  }

  a, a:visited, a:hover {
    text-decoration: inherit;
  }
</style>
