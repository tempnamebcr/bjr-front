<script setup lang="ts">
import type { Summary } from '~/utils/assignment'
import { formatHours, formatNumber, formatPrice } from '~/utils/format'

const props = defineProps<{
  summary: Summary
  lowerBound: number
  provenOptimal: boolean
}>()

const cards = computed(() => [
  {
    label: 'Total price',
    value: formatPrice(props.summary.totalPrice),
    note: 'Σ hourly rate × hours',
  },
  {
    label: 'Makespan',
    value: formatHours(props.summary.makespan),
    note: props.provenOptimal
      ? `Proven optimal (lower bound ${formatHours(props.lowerBound)})`
      : `Lower bound ${formatHours(props.lowerBound)}`,
  },
  {
    label: 'Tasks',
    value: formatNumber(props.summary.taskCount),
    note: 'All assigned',
  },
  {
    label: 'Employees with work',
    value: formatNumber(props.summary.activeEmployeeCount),
    note: `of ${formatNumber(props.summary.employeeCount)} employees`,
  },
])
</script>

<template>
  <dl class="grid grid-cols-2 gap-4 lg:grid-cols-4">
    <div
      v-for="card in cards"
      :key="card.label"
      class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <dt class="text-sm text-slate-500">
        {{ card.label }}
      </dt>
      <dd class="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
        {{ card.value }}
      </dd>
      <dd class="mt-1 text-xs text-slate-500">
        {{ card.note }}
      </dd>
    </div>
  </dl>
</template>
