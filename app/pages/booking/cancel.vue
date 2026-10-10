<script setup lang="ts">
type CancellationResult = {
    status: 'cancelled' | 'paid' | 'completed'
}

const route = useRoute()
const isCancelling = ref(false)
const result = ref<CancellationResult | null>(null)
const errorMessage = ref('')

async function cancelBooking() {
    if (isCancelling.value) return

    isCancelling.value = true
    errorMessage.value = ''

    try {
        result.value = await $fetch<CancellationResult>(
            '/api/bookings/cancel',
            {
                method: 'POST',
                body: {
                    token: route.query.token
                }
            }
        )
    } catch {
        errorMessage.value =
            'Non siamo riusciti ad annullare la prenotazione. Riprova.'
    } finally {
        isCancelling.value = false
    }
}
</script>

<template>
    <main class="mx-auto max-w-2xl px-6 py-16 text-center">
        <template v-if="result?.status === 'cancelled'">
            <h1 class="text-3xl font-bold text-orange-600">
                Prenotazione annullata
            </h1>

            <p class="mt-4">
                I posti riservati sono tornati disponibili.
            </p>
        </template>

        <template v-else-if="result">
            <h1 class="text-3xl font-bold">
                Il pagamento è già stato completato
            </h1>

            <p class="mt-4">
                Non è possibile annullare la prenotazione da questa pagina.
            </p>
        </template>

        <template v-else>
            <h1 class="text-3xl font-bold">
                Vuoi annullare la prenotazione?
            </h1>

            <p class="mt-4 text-gray-600">
                Chiuderemo il pagamento e libereremo i posti riservati.
            </p>

            <button type="button" :disabled="isCancelling"
                class="mt-6 rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
                @click="cancelBooking">
                {{ isCancelling ? 'Annullamento in corso...' : 'Conferma annullamento' }}
            </button>

            <p v-if="errorMessage" role="alert" class="mt-4 text-red-700">
                {{ errorMessage }}
            </p>
        </template>

        <NuxtLink to="/" class="mt-8 block text-orange-700 underline">
            Torna alle esperienze
        </NuxtLink>
    </main>
</template>