<script setup lang="ts">
type CardProps = {
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
  </article>
</template>