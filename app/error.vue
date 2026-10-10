<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{
  error: NuxtError
}>()

function goHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <main class="mx-auto max-w-2xl px-6 py-20 text-center">
    <h1 class="text-5xl font-bold text-orange-600">
      {{ error.status }}
    </h1>

    <p class="mt-6 text-xl">
      {{
        error.status === 404
          ? 'Questa pagina non esiste o non è più disponibile.'
          : 'Qualcosa è andato storto.'
      }}
    </p>

    <button
      type="button"
      class="mt-8 rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white"
      @click="goHome"
    >
      Torna alle esperienze
    </button>
  </main>
</template>