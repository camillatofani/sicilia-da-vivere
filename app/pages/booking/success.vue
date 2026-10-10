<script setup lang="ts">
type BookingStatus = {
  status: 'pending' | 'paid' | 'expired' | 'cancelled'
  participants: number
  total: number
}

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const { cartReady, clearPaidCart } = useCart()

const {
  data: booking,
  status,
  error,
  refresh
} = await useFetch<BookingStatus>('/api/bookings/status', {
  query: {
    session_id: computed(() => route.query.session_id)
  }
})

watch(
  [
    cartReady,
    () => booking.value?.status,
    () => route.query.session_id
  ],
  ([ready, bookingStatus, sessionId]) => {
    if (
      ready &&
      bookingStatus === 'paid' &&
      typeof sessionId === 'string'
    ) {
      clearPaidCart(sessionId)
    }
  },
  { immediate: true }
)
</script>

<template>
  <main class="mx-auto max-w-2xl px-6 py-16 text-center">
    <RequestState :status="status" :has-error="Boolean(error)" :loading-message="t('booking.checking')"
      :error-message="t('booking.loadError')">
      <section v-if="booking">
        <template v-if="booking.status === 'paid'">
          <h1 class="text-3xl font-bold text-orange-600">
            {{ t('booking.confirmed') }}
          </h1>

          <p class="mt-4">
            {{ t('booking.participants') }}: {{ booking.participants }}
          </p>

          <p class="mt-2 font-semibold">
            {{ t('booking.paidTotal') }}: {{ booking.total }} €
          </p>
        </template>

        <template v-else-if="booking.status === 'pending'">
          <h1 class="text-3xl font-bold">
            {{ t('booking.processing') }}
          </h1>

          <p class="mt-4 text-gray-600">
            {{ t('booking.waiting') }}
          </p>
        </template>

        <template v-else>
          <h1 class="text-3xl font-bold">
            {{
              booking.status === 'expired'
                ? t('booking.expired')
                : t('booking.cancelled')
            }}
          </h1>

          <p class="mt-4 text-gray-600">
            {{ t('booking.inactive') }}
          </p>
        </template>
      </section>
    </RequestState>

    <button v-if="error || booking?.status === 'pending'" type="button" :disabled="status === 'pending'"
      class="mt-6 rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white disabled:opacity-50" @click="refresh()">
      {{ t('booking.refresh') }}
    </button>

    <NuxtLink :to="localePath({ name: 'index' })" class="mt-8 block text-orange-700 underline">
      {{ t('experience.back') }}
    </NuxtLink>
  </main>
</template>