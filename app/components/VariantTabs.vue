<script setup lang="ts">
import type { Variant } from '#shared/types/assignment'

const selected = defineModel<Variant>({ required: true })

const tabs: { value: Variant, label: string, hint: string }[] = [
  { value: 'cost', label: 'Min cost', hint: 'Cheapest total price' },
  { value: 'makespan', label: 'Min makespan', hint: 'Earliest finish' },
]
</script>

<template>
  <div
    role="tablist"
    aria-label="Optimization variant"
    class="inline-flex rounded-lg bg-slate-100 p-1"
  >
    <button
      v-for="tab in tabs"
      :key="tab.value"
      type="button"
      role="tab"
      :aria-selected="selected === tab.value"
      :title="tab.hint"
      class="rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-sky-600"
      :class="selected === tab.value
        ? 'bg-white text-slate-900 shadow-sm'
        : 'text-slate-600 hover:text-slate-900'"
      @click="selected = tab.value"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
