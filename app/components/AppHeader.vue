<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { cart, cartReady } = useCart()

// cartReady è false sul server e al primo render client: nessun mismatch.
const hasCartItem = computed(() => cartReady.value && Boolean(cart.value))
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-sand-dark/70 bg-cream/95 backdrop-blur">
    <div class="container-page flex items-center justify-between gap-3 py-3">
      <NuxtLink :to="localePath({ name: 'index' })"
        class="flex min-w-0 items-center gap-2 font-display text-lg font-bold leading-tight text-ink sm:text-xl">
        <svg class="size-7 shrink-0 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" fill="currentColor" stroke="none" />
          <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" />
        </svg>
        <span class="truncate">{{ t('home.title') }}</span>
      </NuxtLink>

      <div class="flex shrink-0 items-center gap-2">
        <LanguageSwitcher />

        <NuxtLink :to="localePath({ name: 'cart' })"
          class="relative inline-flex size-12 items-center justify-center gap-2 rounded-full bg-sand text-ink transition-colors hover:bg-sand-dark/60 sm:w-auto sm:px-5">
          <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 4h2l2.2 11h10.6L20 7.5H6.2" />
            <circle cx="9" cy="19.5" r="1.3" />
            <circle cx="17" cy="19.5" r="1.3" />
          </svg>
          <span class="sr-only sm:not-sr-only sm:text-sm sm:font-semibold">{{ t('cart.title') }}</span>
          <template v-if="hasCartItem">
            <span class="absolute right-1.5 top-1.5 size-3 rounded-full bg-orange-700 ring-2 ring-cream sm:static sm:ring-0"
              aria-hidden="true" />
            <span class="sr-only">, {{ t('cart.badge') }}</span>
          </template>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>
