<script setup lang="ts">
type BookingStatus = {
  status: 'pending' | 'paid' | 'expired' | 'cancelled'
  participants: number
  total: number
}

const route = useRoute()

const {
  data: booking,
  status,
  error,
  refresh
} = await useFetch<BookingStatus>('/api/bookings/status', {
  query: {
    session_id: route.query.session_id
  }
})
</script>

<template>
  <main class="mx-auto max-w-2xl px-6 py-16 text-center">
    <RequestState
      :status="status"
      :has-error="Boolean(error)"
      loading-message="Verifichiamo la prenotazione..."
      error-message="Non siamo riusciti a verificare la prenotazione."
    >
      <section v-if="booking">
        <template v-if="booking.status === 'paid'">
          <h1 class="text-3xl font-bold text-orange-600">
            Prenotazione confermata!
          </h1>

          <p class="mt-4">
            Partecipanti: {{ booking.participants }}
          </p>

          <p class="mt-2 font-semibold">
            Totale pagato: {{ booking.total }} €
          </p>
        </template>

        <template v-else-if="booking.status === 'pending'">
          <h1 class="text-3xl font-bold">
            Conferma in elaborazione
          </h1>

          <p class="mt-4 text-gray-600">
            Stiamo aspettando la conferma del pagamento.
          </p>
        </template>

        <template v-else>
          <h1 class="text-3xl font-bold">
            Prenotazione
            {{ booking.status === 'expired' ? 'scaduta' : 'annullata' }}
          </h1>

          <p class="mt-4 text-gray-600">
            Questa prenotazione non è attiva.
          </p>
        </template>
      </section>
    </RequestState>

    <button
      v-if="error || booking?.status === 'pending'"
      type="button"
      :disabled="status === 'pending'"
      class="mt-6 rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
      @click="refresh()"
    >
      Ricontrolla lo stato
    </button>

    <NuxtLink
      to="/"
      class="mt-8 block text-orange-700 underline"
    >
      Torna alle esperienze
    </NuxtLink>
  </main>
</template>