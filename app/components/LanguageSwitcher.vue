<script setup lang="ts">
const { locale, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const languages = [
  { code: 'it', label: 'Italiano', short: 'IT' },
  { code: 'en', label: 'English', short: 'EN' }
] as const
</script>

<template>
  <nav :aria-label="t('nav.language')" class="flex rounded-full bg-sand p-1">
    <NuxtLink
      v-for="language in languages"
      :key="language.code"
      :to="switchLocalePath(language.code)"
      :lang="language.code"
      :hreflang="language.code"
      :aria-current="locale === language.code ? 'page' : undefined"
      class="inline-flex min-h-10 items-center rounded-full px-3 text-sm font-semibold transition-colors sm:px-4"
      :class="locale === language.code
        ? 'bg-orange-700 text-white'
        : 'text-ink hover:bg-sand-dark/60'"
    >
      <span class="sm:hidden" aria-hidden="true">{{ language.short }}</span>
      <span class="sr-only sm:not-sr-only">{{ language.label }}</span>
    </NuxtLink>
  </nav>
</template>
