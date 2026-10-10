<script setup lang="ts">
type CancellationResult = {
    status: 'cancelled' | 'paid' | 'completed'
}

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const isCancelling = ref(false)
const result = ref<CancellationResult | null>(null)
const hasError = ref(false)

async function cancelBooking() {
    if (isCancelling.value) return

    isCancelling.value = true
    hasError.value = false

    try {
        result.value = await $fetch<CancellationResult>(
            '/api/bookings/cancel',
            {
                method: 'POST',
                body: {
                    token: route.query.token
                }
            }
        )
    } catch {
        hasError.value = true
    } finally {
        isCancelling.value = false
    }
}
</script>

<template>
    <main class="mx-auto max-w-2xl px-6 py-16 text-center">
        <template v-if="result?.status === 'cancelled'">
            <h1 class="text-3xl font-bold text-orange-600">
                {{ t('booking.cancelled') }}
            </h1>

            <p class="mt-4">
                {{ t('booking.released') }}
            </p>
        </template>

        <template v-else-if="result">
            <h1 class="text-3xl font-bold">
                {{ t('booking.alreadyCompleted') }}
            </h1>

            <p class="mt-4">
                {{ t('booking.cannotCancel') }}
            </p>
        </template>

        <template v-else>
            <h1 class="text-3xl font-bold">
                {{ t('booking.cancelQuestion') }}
            </h1>

            <p class="mt-4 text-gray-600">
                {{ t('booking.cancelExplanation') }}
            </p>

            <button type="button" :disabled="isCancelling"
                class="mt-6 rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
                @click="cancelBooking">
                {{
                    isCancelling
                        ? t('booking.cancelling')
                        : t('booking.confirmCancellation')
                }}
            </button>

            <p v-if="hasError" role="alert" class="mt-4 text-red-700">
                {{ t('booking.cancelError') }}
            </p>
        </template>

        <NuxtLink :to="localePath({ name: 'index' })" class="mt-8 block text-orange-700 underline">
            {{ t('experience.back') }}
        </NuxtLink>
    </main>
</template>