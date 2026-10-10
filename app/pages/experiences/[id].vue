<script setup lang="ts">
import type {
  Experience,
  Departure
} from '~~/shared/types/experience'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const { cart, cartReady, setCart } = useCart()

const isEditing = computed(() => {
  return route.query.edit === '1'
    && cart.value?.experienceId === Number(route.params.id)
})

const restoredSelection = ref(false)

const {
  data: experience,
  status: statusExp,
  error: errorExp,
  refresh: refreshExp
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
  error: errorDep,
  refresh: refreshDep
} = await useFetch<Departure[]>(
  () => `/api/experiences/${route.params.id}/departures`
)

useHead({ title: () => experience.value?.title ?? t('home.title') })

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

watch(
  [cartReady, cart, departures, () => route.query.edit],
  () => {
    if (
      restoredSelection.value ||
      !cartReady.value ||
      !isEditing.value ||
      !cart.value ||
      !departures.value
    ) {
      return
    }

    const savedDeparture = departures.value.find(
      departure => departure.id === cart.value?.departureId
    )

    if (savedDeparture) {
      selectedDepartureId.value = savedDeparture.id

      participants.value = savedDeparture.available === 0
        ? 0
        : Math.min(cart.value.participants, savedDeparture.available)
    }

    restoredSelection.value = true
  },
  { immediate: true }
)

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

async function addToCart() {
  if (!canBook.value || !experience.value || !selectedDeparture.value) {
    return
  }

  setCart({
    experienceId: experience.value.id,
    departureId: selectedDeparture.value.id,
    participants: participants.value
  })

  await navigateTo(localePath({ name: 'cart' }))
}
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <NuxtLink :to="localePath({ name: 'index' })" class="link-quiet inline-flex min-h-10 items-center">
      <span aria-hidden="true">←&nbsp;</span>{{ t('experience.back') }}
    </NuxtLink>

    <div class="mt-6">
      <RequestState :status="statusExp" :has-error="Boolean(errorExp)" :loading-message="t('common.loading')"
        :error-message="t('experience.loadError')" retryable @retry="refreshExp()">
        <article v-if="experience" class="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
          <img :src="experience.imageUrl" :alt="experience.title" width="1200" height="800"
            class="aspect-[3/2] w-full rounded-3xl object-cover lg:sticky lg:top-24 lg:aspect-[4/5] lg:h-auto" />

          <div>
            <h1 class="text-4xl font-bold leading-tight sm:text-5xl">
              {{ experience.title }}
            </h1>

            <p class="mt-4 text-lg text-ink-soft">
              {{ experience.description }}
            </p>

            <p class="mt-6">
              <span class="font-display text-3xl font-bold">{{ experience.price }} €</span>
              <span class="ml-1 text-ink-soft">{{ t('experience.price') }}</span>
            </p>

            <section class="card mt-8 p-6 sm:p-8" aria-labelledby="plan-title">
              <h2 id="plan-title" class="text-2xl font-bold">{{ t('experience.plan') }}</h2>

              <div class="mt-6">
                <RequestState :status="statusDep" :has-error="Boolean(errorDep)" :loading-message="t('common.loading')"
                  :error-message="t('experience.departuresError')" retryable @retry="refreshDep()">
                  <label for="departure" class="field-label">
                    {{ t('experience.departure') }}
                  </label>

                  <select id="departure" v-model.number="selectedDepartureId" class="field mt-2">
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

                <div v-if="selectedDeparture" role="status" class="mt-4 space-y-1 rounded-2xl bg-sand px-4 py-3 text-sm">
                  <p class="font-semibold">
                    {{ t('experience.selectedDeparture', {
                      date: selectedDeparture.date,
                      time: selectedDeparture.time
                    }) }}
                  </p>

                  <p class="text-ink-soft">
                    {{ t('experience.capacity', {
                      count: selectedDeparture.capacity
                    }) }}
                  </p>

                  <p :class="selectedDeparture.available === 0 ? 'font-semibold text-brick' : 'text-ink'">
                    {{
                      selectedDeparture.available === 0
                        ? t('experience.soldOut')
                        : t('experience.available', {
                          count: selectedDeparture.available
                        })
                    }}
                  </p>
                </div>
              </div>

              <div class="mt-6">
                <label for="participants" class="field-label">
                  {{ t('experience.participants') }}
                </label>

                <select id="participants" v-model.number="participants" :disabled="!selectedDeparture ||
                  selectedDeparture.available === 0
                  " class="field mt-2">
                  <option v-for="number in (selectedDeparture?.available ?? 0)" :key="number" :value="number">
                    {{ number }}
                  </option>
                </select>
              </div>

              <div class="mt-8 flex items-baseline justify-between gap-4 border-t border-sand-dark pt-6">
                <p class="text-ink-soft">{{ t('experience.total') }}</p>
                <p class="font-display text-3xl font-bold">{{ total }} €</p>
              </div>

              <button type="button" :disabled="!canBook" class="btn btn-primary mt-6 w-full" @click="addToCart">
                {{
                  isEditing
                    ? t('experience.updateSelection')
                    : t('experience.addToCart')
                }}
              </button>
            </section>
          </div>
        </article>
      </RequestState>
    </div>
  </div>
</template>
