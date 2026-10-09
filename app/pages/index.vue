<script setup lang="ts">
    import type { Experience } from '~~/shared/types/experience'
    
    const { data: experiences, status, error } = await useFetch<Experience[]>('/api/experiences')
    
    const title = 'Sicilia, da vivere';
</script>

<template>
  <main>
    <h1>{{ title }}</h1>
    <p>Scopri le esperienze della nostra isola.</p>

    <section>
        <h2>Le esperienze</h2>
        <p v-if="status === 'pending'">Caricamento...</p>
        <p v-else-if="error">Non siamo riusciti a caricare i contenuti.</p>
        <div v-else>
            <ExperienceCard
                v-for="experience in experiences"
                    :key="experience.id"
                    :id="experience.id"
                    :title="experience.title"
                    :description="experience.description"
                    :price="experience.price"
            />
        </div>
    </section>

  </main>
</template>