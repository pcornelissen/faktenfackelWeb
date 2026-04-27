<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  subtitle?: string
  group?: string
}>(), {
  title: 'Quelle',
  subtitle: '',
  group: 'QUELLE',
})
// Bewusst kein Profilbild im OG-Image: beim Teilen verbreitet Faktenfackel
// das Bild selbst, was bei fremden Pressefotos urheberrechtlich heikel ist.
// Der Flame-Block rechts gibt das Bild stattdessen Faktenfackel-Identität.
</script>

<template>
  <div style="display: flex; width: 1200px; height: 630px; background-color: #F5F0E8; position: relative;">
    <!-- Top stripe -->
    <div style="position: absolute; top: 0; left: 0; width: 1200px; height: 6px; background-color: #F98C35;" />

    <!-- Left text panel -->
    <div style="display: flex; flex-direction: column; width: 741px; height: 630px; padding: 32px 56px 24px 56px;">
      <!-- Category label + underline -->
      <div style="display: flex; flex-direction: column; margin-bottom: 18px;">
        <span style="font-family: 'Ubuntu Mono'; font-weight: 700; font-size: 22px; color: #F98C35; letter-spacing: 0.05em;">
          {{ group }}
        </span>
        <div style="width: 96px; height: 2px; background-color: #F98C35; margin-top: 6px;" />
      </div>

      <!-- Title (Quellen-Name) -->
      <div style="display: flex; flex-direction: column; flex: 1; justify-content: flex-start;">
        <h1 style="font-family: 'Playfair Display'; font-weight: 700; font-size: 72px; color: #1C1917; line-height: 1.08; margin: 0 0 22px 0;">
          {{ title }}
        </h1>
        <p
          v-if="subtitle"
          style="font-family: 'Playfair Display'; font-weight: 700; font-size: 32px; color: #78716C; line-height: 1.3; margin: 0;"
        >
          {{ subtitle }}
        </p>
      </div>

      <!-- Bottom plinth -->
      <div style="display: flex; flex-direction: column;">
        <div style="height: 1px; background-color: #78716C; margin-bottom: 14px;" />
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-family: 'Ubuntu Mono'; font-weight: 400; font-size: 20px; color: #78716C;">
            faktenfackel.de
          </span>
          <div style="display: flex;">
            <span style="font-family: 'Ubuntu Mono'; font-weight: 700; font-size: 22px; color: #1C1917;">FAKTEN</span>
            <span style="font-family: 'Ubuntu Mono'; font-weight: 700; font-size: 22px; color: #F98C35;">FACKEL</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Boundary line -->
    <div style="position: absolute; left: 739px; top: 0; width: 2px; height: 630px; background-color: #F98C35;" />

    <!-- Right dark panel with flame -->
    <div style="display: flex; align-items: center; justify-content: center; width: 459px; height: 630px; background-color: #1A1612;">
      <img
        src="/img/flame-light.svg"
        alt=""
        width="220"
        height="500"
        style="opacity: 0.9;"
      >
    </div>
  </div>
</template>
