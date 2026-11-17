<script setup lang="ts">
import { describeError, isRetryable } from '~/utils/errors'

useHead({ title: 'Task assignment dashboard' })

const { data, status, error, refresh } = await useAssignments()

const variant = useSelectedVariant()
const employeeFilter = ref<number | null>(null)

// Employee ids with work differ per variant, so a filter from the other tab would be stale.
watch(variant, () => {
  employeeFilter.value = null
})

const { feasible, summary } = useVariantView(data, variant, employeeFilter)

const errorMessage = computed(() => describeError(error.value))
const errorRetryable = computed(() => isRetryable(error.value))
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <div class="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold">
            Task assignment
          </h1>
          <p class="text-sm text-slate-500">
            Each task goes to an employee with enough skill; employees work their tasks one after another.
          </p>
        </div>
        <VariantTabs v-model="variant" />
      </header>

      <LoadingState v-if="status === 'pending'" />

      <ErrorState
        v-else-if="error"
        :message="errorMessage"
        :retryable="errorRetryable"
        @retry="refresh()"
      />

      <template v-else-if="feasible && summary">
        <SummaryCards
          :summary="summary"
          :lower-bound="feasible.meta.lowerBound"
          :proven-optimal="feasible.meta.provenOptimal"
        />
      </template>
    </div>
  </div>
</template>
