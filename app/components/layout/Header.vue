<script setup lang="ts">
import Menu from '~/components/layout/Menu.vue'
import SearchBar from '~/components/layout/SearchBar.vue'

const route = useRoute()
</script>

<template>
  <div class="sticky top-0 z-50 bg-white  shadow-md">
    <div class="headerRow">
      <NuxtLink
        to="/"
        class="logo"
      >
        <NuxtImg
          src="/img/logo.png"
          format="png"
          alt="FaktenFackel Logo"
          height="100"
          width="100"
        />
      </NuxtLink>
      <div style="flex-grow: 1">
        <h1>{{ route.meta.pageHeading }}</h1>
        <div class="subtitle">
          {{ route.meta.pageSubHeading }}
        </div>
        <Menu />
      </div>
      <search-bar />
    </div>
    <USeparator color="primary" />
  </div>
</template>

<style scoped>
  .headerRow {
    display: flex;
    justify-content: flex-start;
    align-items: end;
    margin-bottom: 0.5rem;
    margin-top: 1rem;
  }

  h1 {
    line-height: 1.5rem;
  }

  .subtitle {
    font-size: 1rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }

  Menu {
    margin-top: 1.5rem;
  }

  .logo {
    margin-bottom: 0.2rem;
    margin-left: 1.4rem;
  }
</style>
