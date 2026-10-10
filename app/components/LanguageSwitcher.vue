<script setup lang="ts">
const { locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()
</script>

<template>
  <nav aria-label="Language" class="flex gap-3">
    <NuxtLink
      :to="switchLocalePath('it')"
      lang="it"
      :aria-current="locale === 'it' ? 'page' : undefined"
      class="rounded-lg px-3 py-2"
      :class="locale === 'it'
        ? 'bg-orange-600 text-white'
        : 'text-orange-700 underline'"
    >
      Italiano
    </NuxtLink>

    <NuxtLink
      :to="switchLocalePath('en')"
      lang="en"
      :aria-current="locale === 'en' ? 'page' : undefined"
      class="rounded-lg px-3 py-2"
      :class="locale === 'en'
        ? 'bg-orange-600 text-white'
        : 'text-orange-700 underline'"
    >
      English
    </NuxtLink>
  </nav>
</template>