<script setup lang="ts">
const { t, locale } = useI18n()

import type { Experience } from '~~/shared/types/experience'

const {
    data: experiences,
    status,
    error,
    refresh
} = await useFetch<Experience[]>('/api/experiences', {
    query: {
        locale
    }
})

useHead({ title: () => t('home.title') })
</script>

<template>
    <div>
        <section class="relative isolate overflow-hidden bg-ink text-white">
            <img src="/images/etna.avif" alt="" width="1600" height="900" fetchpriority="high"
                class="absolute inset-0 -z-20 size-full object-cover" />
            <div class="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-ink/55 to-ink/20" />

            <div class="container-page flex min-h-[26rem] flex-col justify-end py-12 sm:min-h-[34rem] sm:py-20">
                <h1 class="max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
                    {{ t('home.title') }}
                </h1>
                <p class="mt-4 max-w-xl text-lg text-white/90 sm:text-xl">
                    {{ t('home.subtitle') }}
                </p>

                <div class="mt-8">
                    <a href="#experiences" class="btn btn-primary">
                        {{ t('home.cta') }}
                        <span aria-hidden="true">↓</span>
                    </a>
                </div>
            </div>
        </section>

        <section id="experiences" class="container-page scroll-mt-20 py-14 sm:py-20" aria-labelledby="experiences-title">
            <h2 id="experiences-title" class="text-3xl font-bold sm:text-4xl">{{ t('experience.title') }}</h2>

            <div class="mt-8">
                <RequestState :status="status" :has-error="Boolean(error)" :loading-message="t('common.loading')"
                    :error-message="t('experience.catalogError')" retryable @retry="refresh()">
                    <p v-if="!experiences?.length" class="rounded-2xl bg-sand px-5 py-4 text-ink-soft">
                        {{ t('experience.empty') }}
                    </p>

                    <ul v-else class="grid grid-cols-1 gap-8 md:grid-cols-2">
                        <li v-for="experience in experiences" :key="experience.id">
                            <ExperienceCard :id="experience.id" :title="experience.title"
                                :description="experience.description" :price="experience.price"
                                :image-url="experience.imageUrl" class="h-full" />
                        </li>
                    </ul>
                </RequestState>
            </div>
        </section>
    </div>
</template>
