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

useHead({ title: () => t('booking.confirmed') })

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
  <div>
    <section v-if="status === 'pending'" class="container-page py-14 sm:py-24">
      <div class="mx-auto max-w-xl">
        <RequestState :status="status" :has-error="false" :loading-message="t('booking.checking')" />
      </div>
    </section>

    <StatusPanel v-else-if="error || status === 'error'" tone="error" :title="t('booking.loadError')">
      <template #actions>
        <button type="button" class="btn btn-primary" @click="refresh()">
          {{ t('booking.refresh') }}
        </button>
        <NuxtLink :to="localePath({ name: 'index' })" class="link-quiet">{{ t('experience.back') }}</NuxtLink>
      </template>
    </StatusPanel>

    <StatusPanel v-else-if="booking?.status === 'paid'" tone="success" :title="t('booking.confirmed')">
      <p>{{ t('booking.participants') }}: <strong class="text-ink">{{ booking.participants }}</strong></p>
      <p class="font-display text-2xl font-bold text-ink">{{ t('booking.paidTotal') }}: {{ booking.total }} €</p>
      <template #actions>
        <NuxtLink :to="localePath({ name: 'index' })" class="btn btn-primary">{{ t('experience.back') }}</NuxtLink>
      </template>
    </StatusPanel>

    <StatusPanel v-else-if="booking?.status === 'pending'" tone="info" :title="t('booking.processing')">
      <p role="status">{{ t('booking.waiting') }}</p>
      <template #actions>
        <button type="button" class="btn btn-primary" @click="refresh()">
          {{ t('booking.refresh') }}
        </button>
        <NuxtLink :to="localePath({ name: 'index' })" class="link-quiet">{{ t('experience.back') }}</NuxtLink>
      </template>
    </StatusPanel>

    <StatusPanel v-else-if="booking" tone="warning"
      :title="booking.status === 'expired' ? t('booking.expired') : t('booking.cancelled')">
      <p>{{ t('booking.inactive') }}</p>
      <template #actions>
        <NuxtLink :to="localePath({ name: 'index' })" class="btn btn-primary">{{ t('experience.back') }}</NuxtLink>
      </template>
    </StatusPanel>
  </div>
</template>
