<script setup lang="ts">
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
  <article class="overflow-hidden rounded-2xl border border-gray-200 p-4">
    <img
      :src="imageUrl"
      :alt="title"
      width="600"
      height="400"
      loading="lazy"
      class="aspect-[3/2] w-full rounded-lg object-cover"
    />

    <h2 class="mt-4 text-xl font-semibold">{{ title }}</h2>
    <p class="mt-2 text-gray-600">{{ description }}</p>
    <p class="mt-4 font-semibold">{{ price }} € a persona</p>

    <NuxtLink
      :to="`/experiences/${id}`"
      class="mt-4 inline-block text-orange-700 underline"
    >
      Scopri l’esperienza
    </NuxtLink>
  </article>
</template>