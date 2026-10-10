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

useHead({ title: () => t('cart.title') })

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
  <div class="container-page py-8 sm:py-12">
    <NuxtLink :to="localePath({ name: 'index' })" class="link-quiet inline-flex min-h-10 items-center">
      <span aria-hidden="true">←&nbsp;</span>{{ t('experience.back') }}
    </NuxtLink>

    <h1 class="mt-4 text-4xl font-bold sm:text-5xl">
      {{ t('cart.title') }}
    </h1>

    <p v-if="!cartReady" role="status" class="mt-8 rounded-2xl bg-sand px-5 py-4 text-ink-soft">
      {{ t('common.loading') }}
    </p>

    <div v-else-if="!cart" class="card mt-8 p-8 text-center sm:p-12">
      <p class="text-lg text-ink-soft">{{ t('cart.empty') }}</p>
      <NuxtLink :to="localePath({ name: 'index' })" class="btn btn-primary mt-6">
        {{ t('cart.browse') }}
      </NuxtLink>
    </div>

    <section v-else class="mt-8" :aria-label="t('cart.title')">
      <p v-if="isLoading" role="status" class="rounded-2xl bg-sand px-5 py-4 text-ink-soft">
        {{ t('common.loading') }}
      </p>

      <div v-else-if="hasError" role="alert" class="rounded-2xl bg-brick-soft px-5 py-4 text-brick">
        <p class="font-medium">{{ t('cart.loadError') }}</p>

        <button type="button" class="btn btn-secondary mt-4" @click="refreshDetails()">
          {{ t('cart.refresh') }}
        </button>
      </div>

      <div v-else-if="experience && departure" class="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <article class="card overflow-hidden">
          <img :src="experience.imageUrl" :alt="experience.title" width="1200" height="800"
            class="aspect-[3/1] w-full object-cover sm:aspect-[5/2]" />

          <div class="p-6 sm:p-8">
            <h2 class="text-2xl font-bold sm:text-3xl">
              {{ experience.title }}
            </h2>

            <dl class="mt-6 divide-y divide-sand-dark">
              <div class="flex flex-wrap justify-between gap-x-4 gap-y-1 py-3">
                <dt class="text-ink-soft">{{ t('experience.departure') }}</dt>
                <dd class="font-semibold">
                  {{ t('experience.departureOption', {
                    date: departure.date,
                    time: departure.time
                  }) }}
                </dd>
              </div>

              <div class="flex flex-wrap justify-between gap-x-4 gap-y-1 py-3">
                <dt class="text-ink-soft">{{ t('experience.participants') }}</dt>
                <dd class="font-semibold">{{ cart.participants }}</dd>
              </div>

            </dl>

            <p class="border-t border-sand-dark pt-3 text-sm text-ink-soft">
              {{ t('experience.available', { count: departure.available }) }}
            </p>

            <NuxtLink :to="localePath({
              name: 'experiences-id',
              params: { id: cart.experienceId },
              query: { edit: '1' }
            })" class="link-quiet mt-4 inline-flex min-h-10 items-center">
              {{ t('cart.changeSelection') }}
            </NuxtLink>
          </div>
        </article>

        <aside class="card h-fit p-6 sm:p-8" :aria-label="t('cart.checkout')">
          <div class="flex items-baseline justify-between gap-4">
            <p class="text-ink-soft">{{ t('experience.total') }}</p>
            <p class="font-display text-4xl font-bold">{{ total }} €</p>
          </div>

          <p class="mt-6 rounded-2xl bg-sea-soft px-4 py-3 text-sm text-sea">
            {{ t('cart.reservationNotice') }}
          </p>

          <p v-if="!canCheckout" role="alert" class="mt-4 rounded-2xl bg-brick-soft px-4 py-3 text-sm text-brick">
            {{ t('cart.notEnoughSpots') }}
          </p>

          <button type="button" :disabled="!canCheckout || isBooking" class="btn btn-primary mt-6 w-full"
            @click="checkout">
            {{ isBooking ? t('experience.booking') : t('cart.checkout') }}
          </button>

          <p v-if="bookingError" role="alert" class="mt-4 rounded-2xl bg-brick-soft px-4 py-3 text-sm text-brick">
            {{ bookingError }}
          </p>

          <button type="button" :disabled="isBooking" class="btn btn-secondary mt-3 w-full" @click="clearCart">
            {{ t('cart.clear') }}
          </button>
        </aside>
      </div>

      <div v-else class="space-y-4">
        <p role="alert" class="rounded-2xl bg-brick-soft px-5 py-4 text-brick">
          {{ t('cart.unavailable') }}
        </p>

        <p v-if="bookingError" role="alert" class="rounded-2xl bg-brick-soft px-5 py-4 text-brick">
          {{ bookingError }}
        </p>

        <button type="button" :disabled="isBooking" class="btn btn-secondary" @click="clearCart">
          {{ t('cart.clear') }}
        </button>
      </div>

      <template v-if="isLoading || hasError">
        <button type="button" :disabled="isBooking" class="btn btn-secondary mt-6" @click="clearCart">
          {{ t('cart.clear') }}
        </button>
      </template>
    </section>
  </div>
</template>
