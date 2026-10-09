<script setup lang="ts">
    import type { Experience } from '~~/shared/types/experience'

    const route = useRoute()
    const { data: experience, status, error } = await useFetch<Experience>(() => `/api/experiences/${route.params.id}`)
</script>

<template>
  <main>
    <p v-if="status === 'pending'">Caricamento...</p>
    <p v-else-if="error">Non siamo riusciti a caricare i contenuti.</p>
    <div v-else-if="experience">
        <h1>#{{ route.params.id }} - {{experience.title}}</h1>
        <p>{{ experience.description }}</p>
        <p>{{ experience.price }} € a persona</p>
    </div>

    <NuxtLink to="/">Torna alle esperienze</NuxtLink>
  </main>
</template>