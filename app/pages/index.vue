<script setup lang="ts">
const { t, locale } = useI18n()

import type { Experience } from '~~/shared/types/experience'

const {
    data: experiences,
    status,
    error
} = await useFetch<Experience[]>('/api/experiences', {
    query: {
        locale
    }
})
</script>

<template>
    <main class="mx-auto max-w-6xl p-6">
        <h1 class="text-4xl font-bold text-orange-600">
            {{ t('home.title') }}
        </h1>
        <p>{{ t('home.subtitle') }}</p>

        <section class="mt-8">
            <h2 class="text-2xl font-bold text-orange-600">{{ t('experience.title') }}</h2>
            <p v-if="status === 'pending'">{{ t('common.loading') }}</p>
            <p v-else-if="error">{{ t('experience.loadError') }}</p>
            <div v-else class="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                <ExperienceCard v-for="experience in experiences" :key="experience.id" :id="experience.id"
                    :title="experience.title" :description="experience.description" :price="experience.price"
                    :image-url="experience.imageUrl" />
            </div>
        </section>

    </main>
</template>