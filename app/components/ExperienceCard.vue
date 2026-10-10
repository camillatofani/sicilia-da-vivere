<script setup lang="ts">
const localePath = useLocalePath()
const { t } = useI18n()

type CardProps = {
  id: number
  imageUrl: string
  title?: string
  description?: string
  price?: number
}

withDefaults(defineProps<CardProps>(), {
  title: 'Esperienza siciliana',
  description: 'Scopri questa esperienza.',
  price: 45
})
</script>

<template>
  <article class="group card relative flex flex-col overflow-hidden transition-shadow motion-safe:hover:shadow-xl motion-safe:hover:shadow-orange-900/10">
    <div class="overflow-hidden">
      <img :src="imageUrl" :alt="title" width="600" height="400" loading="lazy"
        class="aspect-[3/2] w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105" />
    </div>

    <div class="flex flex-1 flex-col p-6">
      <h3 class="text-2xl font-bold leading-snug">{{ title }}</h3>
      <p class="mt-2 text-ink-soft">{{ description }}</p>

      <div class="mt-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-3 pt-6">
        <p>
          <span class="font-display text-2xl font-bold">{{ price }}€</span>
          <span class="ml-1 text-sm text-ink-soft">{{ t('experience.price') }}</span>
        </p>

        <NuxtLink
          :to="localePath({
            name: 'experiences-id',
            params: { id }
          })"
          class="link-quiet after:absolute after:inset-0 after:content-['']"
        >
          {{ t('experience.discover') }}<span aria-hidden="true"> →</span>
        </NuxtLink>
      </div>
    </div>
  </article>
</template>
