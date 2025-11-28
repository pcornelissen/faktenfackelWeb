<script setup lang="ts">
  import Menu from '~/components/layout/Menu.vue'

  const route = useRoute()
</script>

<template>
  <div class="headerRow">
    <NuxtLink to="/" style="margin-bottom: 0.2rem;">
      <NuxtImg
        src="/img/logo.png"
        format="png"
        alt="FaktenFackel Logo"
        height="120"
        width="120"
      />
    </NuxtLink>
    <div style="flex-grow: 1">
      <h1>{{ route.meta.title || "Faktenfackel" }}</h1>
      <div class="subTitle">
        {{ route.meta.subTitle || "Fakenews sind wie Ratten und scheuen das Licht" }}
      </div>
      <Menu style="margin-top: 2.5rem"/>
    </div>
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

  .subTitle {
    font-size: 1rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }
</style>
