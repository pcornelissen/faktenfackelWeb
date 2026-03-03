<script setup lang="ts">
import Header from '~/components/layout/Header.vue'
import Footer from '~/components/layout/Footer.vue'

const props = defineProps<{
  error: {
    statusCode: number
    message: string
    statusMessage?: string
  }
}>()

const is404 = computed(() => props.error.statusCode === 404)

function goHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <UApp>
    <Header />
    <main class="error-page">
      <div class="error-inner">
        <div class="error-code">
          {{ error.statusCode }}
        </div>
        <h1 class="error-title">
          {{ is404 ? 'Seite nicht gefunden' : 'Ein Fehler ist aufgetreten' }}
        </h1>
        <p class="error-desc">
          {{ is404
            ? 'Die gesuchte Seite existiert nicht oder wurde verschoben.'
            : error.statusMessage || 'Bitte versuche es später erneut.' }}
        </p>
        <div class="error-actions">
          <button
            class="btn-primary"
            @click="goHome"
          >
            Zur Startseite
          </button>
          <a
            href="/faktenchecks"
            class="btn-secondary"
          >Alle Faktenchecks</a>
        </div>
      </div>
    </main>
    <Footer />
  </UApp>
</template>

<style scoped>
.error-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
}

.error-inner {
  text-align: center;
  max-width: 480px;
}

.error-code {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(5rem, 15vw, 9rem);
  font-weight: 900;
  color: var(--flame);
  line-height: 1;
  margin-bottom: 1rem;
  opacity: 0.8;
}

.error-title {
  font-size: clamp(1.4rem, 4vw, 2rem);
  color: var(--ink);
  margin-bottom: 1rem;
}

.error-desc {
  font-size: 1rem;
  color: var(--muted);
  line-height: 1.6;
  margin-bottom: 2.5rem;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary {
  background: var(--flame);
  color: white;
  padding: 10px 20px;
  border-radius: 3px;
  border: none;
  cursor: pointer;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-weight: 600;
  transition: filter 0.2s, transform 0.1s;
  display: inline-flex;
  align-items: center;
}

.btn-primary:hover {
  filter: brightness(0.88);
  transform: translateY(-1px);
}

.btn-secondary {
  background: transparent;
  color: var(--muted);
  padding: 10px 20px;
  border-radius: 3px;
  text-decoration: none;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border: 1px solid var(--fackel-border);
  transition: border-color 0.2s, color 0.2s;
  display: inline-flex;
  align-items: center;
}

.btn-secondary:hover {
  border-color: var(--flame);
  color: var(--flame);
}
</style>
