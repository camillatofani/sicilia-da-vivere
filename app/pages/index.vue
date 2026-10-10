<script setup lang="ts">
import type { Experience } from '~~/shared/types/experience'

const { data: experiences, status, error } = await useFetch<Experience[]>('/api/experiences')
</script>

<template>
    <main class="mx-auto max-w-6xl p-6">
        <h1 class="text-4xl font-bold text-orange-600">
            Sicilia, da vivere
        </h1>
        <p>Scopri le esperienze della nostra isola.</p>

        <section class="mt-8">
            <h2>Le esperienze</h2>
            <p v-if="status === 'pending'">Caricamento...</p>
            <p v-else-if="error">Non siamo riusciti a caricare i contenuti.</p>
            <div v-else class="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                <ExperienceCard v-for="experience in experiences" :key="experience.id" :id="experience.id"
                    :title="experience.title" :description="experience.description" :price="experience.price"
                    :image-url="experience.imageUrl" />
            </div>
        </section>

    </main>
</template>