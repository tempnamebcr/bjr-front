<script setup lang="ts">
import type { VariantComparison } from '~/utils/assignment'
import { formatHours, formatPercent, formatPrice } from '~/utils/format'

const props = defineProps<{
  comparison: VariantComparison
}>()

const columns = computed(() => [
  { label: 'Min cost', ...props.comparison.cost },
  { label: 'Min makespan', ...props.comparison.makespan },
])
</script>

<template>
  <section
    aria-labelledby="comparison-heading"
    class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
  >
    <h2
      id="comparison-heading"
      class="text-sm font-medium text-slate-500"
    >
      Variant comparison
    </h2>

    <div class="mt-3 grid gap-4 sm:grid-cols-[1fr_1fr_1.4fr]">
      <dl
        v-for="column in columns"
        :key="column.label"
        class="space-y-1"
      >
        <dt class="text-sm font-semibold">
          {{ column.label }}
        </dt>
        <dd class="text-sm tabular-nums text-slate-600">
          {{ formatPrice(column.totalPrice) }} · {{ formatHours(column.makespan) }}
        </dd>
      </dl>

      <p class="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
        Finishing <strong class="tabular-nums">{{ formatHours(comparison.hoursSaved) }}</strong>
        earlier ({{ formatPercent(comparison.hoursSavedPercent) }} faster) costs
        <strong class="tabular-nums">{{ formatPrice(comparison.extraPrice) }}</strong>
        more ({{ formatPercent(comparison.extraPricePercent) }}).
      </p>
    </div>
  </section>
</template>
