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

useHead({ title: () => t('booking.cancelQuestion') })

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
    <StatusPanel v-if="result?.status === 'cancelled'" tone="success" :title="t('booking.cancelled')">
        <p role="status">{{ t('booking.released') }}</p>
        <template #actions>
            <NuxtLink :to="localePath({ name: 'index' })" class="btn btn-primary">{{ t('experience.back') }}</NuxtLink>
        </template>
    </StatusPanel>

    <StatusPanel v-else-if="result" tone="info" :title="t('booking.alreadyCompleted')">
        <p role="status">{{ t('booking.cannotCancel') }}</p>
        <template #actions>
            <NuxtLink :to="localePath({ name: 'index' })" class="btn btn-primary">{{ t('experience.back') }}</NuxtLink>
        </template>
    </StatusPanel>

    <StatusPanel v-else tone="warning" :title="t('booking.cancelQuestion')">
        <p>{{ t('booking.cancelExplanation') }}</p>

        <template #actions>
            <p v-if="hasError" role="alert" class="w-full rounded-2xl bg-brick-soft px-4 py-3 text-sm text-brick">
                {{ t('booking.cancelError') }}
            </p>

            <button type="button" :disabled="isCancelling" class="btn btn-primary" @click="cancelBooking">
                {{
                    isCancelling
                        ? t('booking.cancelling')
                        : t('booking.confirmCancellation')
                }}
            </button>

            <NuxtLink :to="localePath({ name: 'index' })" class="link-quiet">{{ t('experience.back') }}</NuxtLink>
        </template>
    </StatusPanel>
</template>
