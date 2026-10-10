<script setup lang="ts">
import type { Experience, Departure, Booking } from '~~/shared/types/experience'

const route = useRoute()
const { data: experience, status: statusExp, error: errorExp } = await useFetch<Experience>(() => `/api/experiences/${route.params.id}`)
const { data: departures, status: statusDep, error: errorDep, refresh: refreshDepartures } = await useFetch<Departure[]>(() => `/api/experiences/${route.params.id}/departures`)

const participants = ref(1)
const selectedDepartureId = ref<number | ''>('')
const selectedDeparture = computed(() => {
  return departures.value?.find(
    departure => departure.id === selectedDepartureId.value
  )
})
watch(selectedDeparture, (departure) => {
  if (!departure) return

  if (departure.available === 0) {
    participants.value = 0
  } else {
    participants.value = Math.min(
      Math.max(participants.value, 1),
      departure.available
    )
  }
}, { flush: 'post' })
const total = computed(() => {
  return (experience.value?.price ?? 0) * participants.value
})
const canBook = computed(() => {
  const departure = selectedDeparture.value

  return statusDep.value === 'success'
    && !errorDep.value
    && Boolean(departure)
    && participants.value >= 1
    && participants.value <= (departure?.available ?? 0)
})

const isBooking = ref(false)
const bookingError = ref('')

async function book() {
  if (!canBook.value || isBooking.value) return

  isBooking.value = true
  bookingError.value = ''

  try {
    const booking = await $fetch<Booking>('/api/bookings', {
      method: 'POST',
      body: {
        departureId: selectedDepartureId.value,
        participants: participants.value
      }
    })

    window.location.assign(booking.checkoutUrl)
  } catch (error) {
    console.error('Errore prenotazione:', error)
    bookingError.value =
      'Non siamo riusciti a riservare i posti. Potrebbero non essere più disponibili.'
  } finally {
    isBooking.value = false
  }
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

            <p v-if="selectedDeparture" class="mt-2">
              {{
                selectedDeparture.available === 0
                  ? 'Nessun posto disponibile'
                  : `Posti disponibili: ${selectedDeparture.available}`
              }}
            </p>

          </div>

          <div class="mt-6">

            <label for="participants" class="block font-medium">
              Partecipanti
            </label>

            <select id="participants" :disabled="!selectedDeparture" v-model.number="participants"
              class="mt-2 rounded-lg border border-gray-300 p-3">
              <option v-for="number in (selectedDeparture?.available ?? 0)" :key="number" :value="number">
                {{ number }}
              </option>
            </select>

            <p class="mt-4 text-xl font-bold">
              Totale: {{ total }} €
            </p>

            <button type="button" :disabled="!canBook || isBooking" @click="book"
              class="mt-6 rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
              {{ isBooking ? 'Prenotazione in corso...' : 'Prenota' }}
            </button>

            <p v-if="bookingError" role="alert" class="mt-4 text-red-700">
              {{ bookingError }}
            </p>

          </div>
        </article>
      </RequestState>
    </div>
  </main>
</template>