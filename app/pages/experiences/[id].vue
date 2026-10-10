<script setup lang="ts">
import type { Experience, Departure } from '~~/shared/types/experience'

const route = useRoute()
const { data: experience, status: statusExp, error: errorExp } = await useFetch<Experience>(() => `/api/experiences/${route.params.id}`)
const { data: departures, status: statusDep, error: errorDep } = await useFetch<Departure[]>(() => `/api/experiences/${route.params.id}/departures`)

const participants = ref(1)
const selectedDepartureId = ref<number | ''>('')
const selectedDeparture = computed(() => {
  return departures.value?.find(
    departure => departure.id === selectedDepartureId.value
  )
})
watch(selectedDeparture, (departure) => {
  if (departure && participants.value > departure.capacity) {
    participants.value = departure.capacity
  }
}, { flush: 'post' })
const total = computed(() => {
  return (experience.value?.price ?? 0) * participants.value
})
const canBook = computed(() => {
  return statusDep.value === 'success'
    && !errorDep.value
    && Boolean(selectedDeparture.value)
})

function book() {
  window.alert('Avanti alla pagina di pagamento per completare la prenotazione.')
}
</script>

<template>
  <main class="mx-auto max-w-4xl p-6">
    <NuxtLink to="/" class="text-orange-700 underline">
      Torna alle esperienze
    </NuxtLink>

    <div class="mt-6">
      <RequestState :status="statusExp" :has-error="Boolean(errorExp)"
        error-message="Non siamo riusciti a caricare l’esperienza.">
        <article v-if="experience">

          <img :src="experience.imageUrl" :alt="experience.title" width="1200" height="800"
            class="aspect-[3/2] w-full rounded-2xl object-cover" />

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

            <RequestState :status="statusDep" :has-error="Boolean(errorDep)"
              error-message="Non siamo riusciti a caricare le partenze.">
              <label for="departure" class="block font-medium">
                Partenza
              </label>

              <select id="departure" v-model.number="selectedDepartureId"
                class="mt-2 rounded-lg border border-gray-300 p-3">
                <option disabled value="">Scegli una partenza</option>

                <option v-for="departure in departures" :key="departure.id" :value="departure.id">
                  {{ departure.date }} alle {{ departure.time }}
                </option>
              </select>
            </RequestState>

            <p v-if="selectedDeparture" class="mt-2">
              Data selezionata:
              {{ selectedDeparture.date }} alle {{ selectedDeparture.time }}
            </p>

            <p v-if="selectedDeparture" class="mt-2 text-gray-600">
              Massimo {{ selectedDeparture.capacity }} partecipanti per questa partenza.
            </p>

          </div>

          <div class="mt-6">

            <label for="participants" class="block font-medium">
              Partecipanti
            </label>

            <select id="participants" :disabled="!selectedDeparture" v-model.number="participants"
              class="mt-2 rounded-lg border border-gray-300 p-3">
              <option v-for="number in (selectedDeparture?.capacity ?? 0)" :key="number" :value="number">
                {{ number }}
              </option>
            </select>

            <p class="mt-4 text-xl font-bold">
              Totale: {{ total }} €
            </p>

            <button type="button" :disabled="!canBook" @click="book"
              class="mt-6 rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
              Prenota
            </button>

          </div>
        </article>
      </RequestState>
    </div>
  </main>
</template>