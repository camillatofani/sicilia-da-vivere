<script setup lang="ts">
type CardProps = {
  id: number
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
  <article>
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
    <p>{{ price }} € a persona</p>
    <NuxtLink :to="`/experiences/${id}`">
      Scopri l'esperienza
    </NuxtLink>
  </article>
</template>