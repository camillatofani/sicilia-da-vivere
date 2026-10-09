<script setup lang="ts">
    import type { Experience } from '~~/shared/types/experience'

    const route = useRoute()
    const { data: experience, status, error } = await useFetch<Experience>(() => `/api/experiences/${route.params.id}`)

    const participants = ref(1)
    const total = computed(() => {
      return (experience.value?.price ?? 0) * participants.value
    })
</script>

<template>
  <main class="mx-auto max-w-4xl p-6">
    <NuxtLink to="/" class="text-orange-700 underline">
      Torna alle esperienze
    </NuxtLink>

    <p v-if="status === 'pending'" class="mt-6">
      Caricamento...
    </p>

    <p v-else-if="error" class="mt-6">
      Non siamo riusciti a caricare l’esperienza.
    </p>

    <article v-else-if="experience" class="mt-6">
      <img
        :src="experience.imageUrl"
        :alt="experience.title"
        width="1200"
        height="800"
        class="aspect-[3/2] w-full rounded-2xl object-cover"
      />

      <h1 class="mt-6 text-3xl font-bold">
        {{ experience.title }}
      </h1>

      <p class="mt-4 text-gray-600">
        {{ experience.description }}
      </p>

      <p class="mt-6 text-xl font-semibold">
        {{ experience.price }} € a persona
      </p>

      <div class="mt-6">
        <label for="participants" class="block font-medium">
          Partecipanti
        </label>

        <select
          id="participants"
          v-model.number="participants"
          class="mt-2 rounded-lg border border-gray-300 p-3"
        >
          <option v-for="number in 6" :key="number" :value="number">
            {{ number }}
          </option>
        </select>

        <p class="mt-4 text-xl font-bold">
          Totale: {{ total }} €
        </p>
      </div>
    </article>
  </main>
</template>