<script setup lang="ts">
type StatusPanelProps = {
  title: string
  tone?: 'success' | 'info' | 'warning' | 'error'
}

const props = withDefaults(defineProps<StatusPanelProps>(), {
  tone: 'info'
})

const toneClasses = {
  success: 'bg-olive-soft text-olive',
  info: 'bg-sea-soft text-sea',
  warning: 'bg-orange-100 text-orange-900',
  error: 'bg-brick-soft text-brick'
}
</script>

<template>
  <section class="container-page py-14 sm:py-24">
    <div class="card mx-auto max-w-xl p-8 text-center sm:p-12">
      <div class="mx-auto flex size-16 items-center justify-center rounded-full" :class="toneClasses[props.tone]">
        <svg class="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path v-if="tone === 'success'" d="M5 12.5l4.5 4.5L19 7.5" />
          <path v-else-if="tone === 'info'" d="M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          <path v-else-if="tone === 'warning'" d="M12 8v5M12 16.5v.01M10.3 3.9L2.7 17.2A2 2 0 0 0 4.4 20h15.2a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0z" />
          <path v-else d="M6 6l12 12M18 6L6 18" />
        </svg>
      </div>

      <h1 class="mt-6 text-3xl font-bold sm:text-4xl">{{ title }}</h1>

      <div class="mt-4 space-y-2 text-ink-soft">
        <slot />
      </div>

      <div class="mt-8 flex flex-col items-center gap-4">
        <slot name="actions" />
      </div>
    </div>
  </section>
</template>
