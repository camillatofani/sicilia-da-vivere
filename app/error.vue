<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const isNotFound = computed(() => props.error.status === 404)

useHead({ title: () => String(props.error.status ?? t('errors.generic')) })

function goHome() {
  clearError({
    redirect: localePath({ name: 'index' })
  })
}
</script>

<template>
  <AppShell>
    <StatusPanel :tone="isNotFound ? 'warning' : 'error'"
      :title="isNotFound ? t('errors.notFoundTitle') : t('errors.generic')">
      <p v-if="error.status" class="font-display text-5xl font-bold text-orange-700">{{ error.status }}</p>
      <p v-if="isNotFound">{{ t('errors.notFound') }}</p>

      <template #actions>
        <button type="button" class="btn btn-primary" @click="goHome">
          {{ t('experience.back') }}
        </button>
      </template>
    </StatusPanel>
  </AppShell>
</template>
