import type {
  Experience,
  Departure
} from '~~/shared/types/experience'

export function useCartDetails() {
  const { cart, cartReady } = useCart()
  const { locale } = useI18n()

  const experience = ref<Experience | null>(null)
  const departure = ref<Departure | null>(null)
  const isLoading = ref(false)
  const hasError = ref(false)

  let requestVersion = 0

  async function refreshDetails() {
    const version = ++requestVersion
    const item = cart.value

    experience.value = null
    departure.value = null
    hasError.value = false
    isLoading.value = false

    if (!cartReady.value || !item) return

    isLoading.value = true

    try {
      const [experienceData, departuresData] = await Promise.all([
        $fetch<Experience>(`/api/experiences/${item.experienceId}`, {
          query: {
            locale: locale.value
          }
        }),
        $fetch<Departure[]>(
          `/api/experiences/${item.experienceId}/departures`
        )
      ])

      if (version !== requestVersion) return

      experience.value = experienceData
      departure.value = departuresData.find(
        entry => entry.id === item.departureId
      ) ?? null
    } catch {
      if (version === requestVersion) {
        hasError.value = true
      }
    } finally {
      if (version === requestVersion) {
        isLoading.value = false
      }
    }
  }

  watch(
    [cart, cartReady, locale],
    () => refreshDetails(),
    { immediate: true }
  )

  const total = computed(() => {
    return (experience.value?.price ?? 0)
      * (cart.value?.participants ?? 0)
  })

  const canCheckout = computed(() => {
    return cartReady.value
      && !isLoading.value
      && !hasError.value
      && Boolean(experience.value)
      && Boolean(departure.value)
      && (cart.value?.participants ?? 0) >= 1
      && (cart.value?.participants ?? 0)
        <= (departure.value?.available ?? 0)
  })

  return {
    experience,
    departure,
    total,
    isLoading,
    hasError,
    canCheckout,
    refreshDetails
  }
}