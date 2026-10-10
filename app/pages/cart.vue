<script setup lang="ts">
import type { Booking } from '~~/shared/types/experience'

const { t, locale } = useI18n()
const localePath = useLocalePath()

const { cart, cartReady, clearCart, markCheckout } = useCart()

const {
  experience,
  departure,
  total,
  isLoading,
  hasError,
  canCheckout,
  refreshDetails
} = useCartDetails()

const isBooking = ref(false)
const bookingError = ref('')

async function checkout() {
  if (!canCheckout.value || isBooking.value || !cart.value) return

  isBooking.value = true
  bookingError.value = ''

  try {
    const booking = await $fetch<Booking>('/api/bookings', {
      method: 'POST',
      body: {
        departureId: cart.value.departureId,
        participants: cart.value.participants,
        locale: locale.value
      }
    })

    markCheckout(booking.checkoutSessionId)
    window.location.assign(booking.checkoutUrl)
  } catch {
    bookingError.value = t('cart.checkoutError')
    await refreshDetails()
  } finally {
    isBooking.value = false
  }
}
</script>

<template>
  <main class="mx-auto max-w-2xl p-6">
    <h1 class="text-3xl font-bold">
      {{ t('cart.title') }}
    </h1>

    <p v-if="!cartReady" role="status" class="mt-6">
      {{ t('common.loading') }}
    </p>

    <p v-else-if="!cart" class="mt-6">
      {{ t('cart.empty') }}
    </p>

    <section v-else class="mt-6">
      <p v-if="isLoading" role="status">
        {{ t('common.loading') }}
      </p>

      <div v-else-if="hasError">
        <p role="alert" class="text-red-700">
          {{ t('cart.loadError') }}
        </p>

        <button type="button" class="mt-4 text-orange-700 underline" @click="refreshDetails()">
          {{ t('cart.refresh') }}
        </button>
      </div>

      <div v-else-if="experience && departure">
        <h2 class="text-2xl font-semibold">
          {{ experience.title }}
        </h2>

        <p class="mt-4">
          {{ t('experience.departureOption', {
            date: departure.date,
            time: departure.time
          }) }}
        </p>

        <p class="mt-2">
          {{ t('experience.participants') }}: {{ cart.participants }}
        </p>

        <p class="mt-2">
          {{ t('experience.available', {
            count: departure.available
          }) }}
        </p>

        <p class="mt-4 text-xl font-bold">
          {{ t('experience.total') }}: {{ total }} €
        </p>

        <p class="mt-4 text-gray-600">
          {{ t('cart.reservationNotice') }}
        </p>

        <p v-if="!canCheckout" role="alert" class="mt-4 text-red-700">
          {{ t('cart.notEnoughSpots') }}
        </p>

        <button type="button" :disabled="!canCheckout || isBooking"
          class="mt-6 rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          @click="checkout">
          {{ isBooking ? t('experience.booking') : t('cart.checkout') }}
        </button>

        <NuxtLink :to="localePath({
          name: 'experiences-id',
          params: { id: cart.experienceId },
          query: { edit: '1' }
        })" class="mt-4 block text-orange-700 underline">
          {{ t('cart.changeSelection') }}
        </NuxtLink>
      </div>

      <p v-else role="alert" class="text-red-700">
        {{ t('cart.unavailable') }}
      </p>

      <p v-if="bookingError" role="alert" class="mt-4 text-red-700">
        {{ bookingError }}
      </p>

      <button type="button" :disabled="isBooking"
        class="mt-6 rounded-lg border border-gray-300 px-5 py-3 disabled:opacity-50" @click="clearCart">
        {{ t('cart.clear') }}
      </button>
    </section>

    <NuxtLink :to="localePath({ name: 'index' })" class="mt-8 block text-orange-700 underline">
      {{ t('experience.back') }}
    </NuxtLink>
  </main>
</template>