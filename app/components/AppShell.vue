<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <a href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:font-semibold">
      {{ t('nav.skip') }}
    </a>

    <AppHeader />

    <main id="main" tabindex="-1" class="flex-1">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>
