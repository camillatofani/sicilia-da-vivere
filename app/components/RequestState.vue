<script setup lang="ts">
type RequestStateProps = {
    status: 'idle' | 'pending' | 'success' | 'error'
    hasError: boolean
    loadingMessage?: string
    errorMessage?: string
    retryable?: boolean
}

withDefaults(defineProps<RequestStateProps>(), {
    loadingMessage: 'Caricamento...',
    errorMessage: 'Non siamo riusciti a caricare i dati.',
    retryable: false
})

defineEmits<{ retry: [] }>()

const { t } = useI18n()
</script>

<template>
    <div v-if="status === 'pending'" role="status"
        class="flex items-center gap-3 rounded-2xl bg-sand px-5 py-4 text-ink-soft">
        <svg class="size-5 shrink-0 motion-safe:animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3" opacity="0.25" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
        </svg>
        <span>{{ loadingMessage }}</span>
    </div>

    <div v-else-if="hasError || status === 'error'" role="alert"
        class="rounded-2xl bg-brick-soft px-5 py-4 text-brick">
        <p class="font-medium">{{ errorMessage }}</p>

        <button v-if="retryable" type="button" class="btn btn-secondary mt-4" @click="$emit('retry')">
            {{ t('common.retry') }}
        </button>
    </div>

    <slot v-else-if="status === 'success'" />
</template>
