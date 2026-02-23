<script setup lang="ts">
import Menu from '~/components/layout/Menu.vue'
import SearchBar from '~/components/layout/SearchBar.vue'

const route = useRoute()
</script>

<template>
  <div class="sticky top-0 z-50 bg-white  shadow-md">
    <header class="headerRow">
      <NuxtLink
        to="/"
        class="logo"
      >
        <NuxtImg
          src="/img/logo-sm.webp"
          format="webp"
          alt="FaktenFackel Logo"
          height="100"
          width="100"
        />
      </NuxtLink>
      <div class="heading-block">
        <h1>{{ route.meta.pageHeading }}&nbsp;</h1>
        <div class="subtitle">
          {{ route.meta.pageSubHeading }}&nbsp;
        </div>
        <Menu />
      </div>
      <div class="search-container">
        <search-bar />
      </div>
    </header>
    <USeparator color="primary" />
  </div>
</template>

<style scoped>
.headerRow {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 0.5rem;
  margin-top: 1rem;
  transition: ease all .5s;
}
.search-container {
  display: flex;
  justify-content: flex-start;
  align-items: end;
  margin-bottom: 0.5rem;
  margin-top: 1rem;
  transition: ease all .5s;
}
.heading-block {
  flex-grow: 1;
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

@media screen and (max-width: 600px) {
  .headerRow {
    flex-direction: column;
    align-items: center;
    transition: ease all .5s;
  }
  .heading-block {
    margin : 1rem;
    transition: ease all .5s;
  }
}
</style>
