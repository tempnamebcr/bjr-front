<script setup lang="ts">
defineProps<{
  message: string
  retryable: boolean
}>()

defineEmits<{ retry: [] }>()
</script>

<template>
  <div
    role="alert"
    class="rounded-xl border border-red-200 bg-red-50 p-6"
  >
    <h2 class="font-semibold text-red-800">
      Couldn't load the assignments
    </h2>
    <p class="mt-1 text-sm text-red-700">
      {{ message }}
    </p>
    <button
      v-if="retryable"
      type="button"
      class="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
      @click="$emit('retry')"
    >
      Try again
    </button>
  </div>
</template>
