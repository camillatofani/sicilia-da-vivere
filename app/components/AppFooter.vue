<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <footer class="mt-auto border-t border-sand-dark/70 bg-sand">
    <div class="container-page flex flex-col gap-2 py-8 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
      <p class="font-display text-base font-bold text-ink">{{ t('home.title') }}</p>
      <p>{{ t('home.subtitle') }}</p>
    </div>
  </footer>
</template>
