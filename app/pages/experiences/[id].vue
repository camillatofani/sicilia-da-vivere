<script setup lang="ts">
import type {
  Experience,
  Departure,
  Booking
} from '~~/shared/types/experience'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const {
  data: experience,
  status: statusExp,
  error: errorExp
} = await useFetch<Experience>(
  () => `/api/experiences/${route.params.id}`,
  {
    query: {
      locale
    }
  }
)

const {
  data: departures,
  status: statusDep,
  error: errorDep
} = await useFetch<Departure[]>(
  () => `/api/experiences/${route.params.id}/departures`
)

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
    && Boolean(experience.value)
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
        participants: participants.value,
        locale: locale.value
      }
    })

    window.location.assign(booking.checkoutUrl)
  } catch (error) {
    console.error('Errore prenotazione:', error)
    bookingError.value = t('experience.bookingError')
  } finally {
    isBooking.value = false
  }
}
</script>

<template>
  <main class="mx-auto max-w-4xl p-6">
    <NuxtLink :to="localePath({ name: 'index' })" class="text-orange-700 underline">
      {{ t('experience.back') }}
    </NuxtLink>

    <div class="mt-6">
      <RequestState :status="statusExp" :has-error="Boolean(errorExp)" :loading-message="t('common.loading')"
        :error-message="t('experience.loadError')">
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
            {{ experience.price }}€ {{ t('experience.price') }}
          </p>

          <div class="mt-6">
            <RequestState :status="statusDep" :has-error="Boolean(errorDep)" :loading-message="t('common.loading')"
              :error-message="t('experience.departuresError')">
              <label for="departure" class="block font-medium">
                {{ t('experience.departure') }}
              </label>

              <select id="departure" v-model.number="selectedDepartureId" :disabled="isBooking"
                class="mt-2 rounded-lg border border-gray-300 p-3">
                <option disabled value="">
                  {{ t('experience.chooseDeparture') }}
                </option>

                <option v-for="departure in departures" :key="departure.id" :value="departure.id">
                  {{ t('experience.departureOption', {
                    date: departure.date,
                    time: departure.time
                  }) }}
                </option>
              </select>
            </RequestState>

            <template v-if="selectedDeparture">
              <p class="mt-2">
                {{ t('experience.selectedDeparture', {
                  date: selectedDeparture.date,
                  time: selectedDeparture.time
                }) }}
              </p>

              <p class="mt-2 text-gray-600">
                {{ t('experience.capacity', {
                  count: selectedDeparture.capacity
                }) }}
              </p>

              <p class="mt-2">
                {{
                  selectedDeparture.available === 0
                    ? t('experience.soldOut')
                    : t('experience.available', {
                      count: selectedDeparture.available
                    })
                }}
              </p>
            </template>
          </div>

          <div class="mt-6">
            <label for="participants" class="block font-medium">
              {{ t('experience.participants') }}
            </label>

            <select id="participants" v-model.number="participants" :disabled="!selectedDeparture ||
              selectedDeparture.available === 0 ||
              isBooking
              " class="mt-2 rounded-lg border border-gray-300 p-3">
              <option v-for="number in (selectedDeparture?.available ?? 0)" :key="number" :value="number">
                {{ number }}
              </option>
            </select>

            <p class="mt-4 text-xl font-bold">
              {{ t('experience.total') }}: {{ total }}€
            </p>

            <button type="button" :disabled="!canBook || isBooking"
              class="mt-6 rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              @click="book">
              {{ isBooking ? t('experience.booking') : t('experience.book') }}
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