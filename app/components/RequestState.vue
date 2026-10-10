<script setup lang="ts">
type RequestStateProps = {
  status: 'idle' | 'pending' | 'success' | 'error'
  hasError: boolean
  loadingMessage?: string
  errorMessage?: string
}

withDefaults(defineProps<RequestStateProps>(), {
  loadingMessage: 'Caricamento...',
  errorMessage: 'Non siamo riusciti a caricare i dati.'
})
</script>

<template>
  <p v-if="status === 'pending'" role="status">
    {{ loadingMessage }}
  </p>

  <p v-else-if="hasError || status === 'error'" role="alert">
    {{ errorMessage }}
  </p>

  <slot v-else-if="status === 'success'" />
</template>