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

const { feasible, infeasible, summary, filteredRows, filteredTotals, employeeOptions, workload, timeline, ticks, comparison } = useVariantView(data, variant, employeeFilter)

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
        <!-- Independent of the selected tab: both variants side by side. -->
        <VariantComparison
          v-if="comparison"
          :comparison="comparison"
        />

        <SummaryCards
          :summary="summary"
          :lower-bound="feasible.meta.lowerBound"
          :proven-optimal="feasible.meta.provenOptimal"
        />

        <section
          aria-labelledby="workload-heading"
          class="space-y-3"
        >
          <h2
            id="workload-heading"
            class="text-lg font-semibold"
          >
            Employee workload
          </h2>
          <WorkloadChart
            :bars="workload"
            :makespan="feasible.makespan"
          />
        </section>

        <section
          aria-labelledby="timeline-heading"
          class="space-y-3"
        >
          <h2
            id="timeline-heading"
            class="text-lg font-semibold"
          >
            Timeline
          </h2>
          <GanttTimeline
            :lanes="timeline"
            :ticks="ticks"
          />
        </section>

        <section
          aria-labelledby="assignments-heading"
          class="space-y-3"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2
              id="assignments-heading"
              class="text-lg font-semibold"
            >
              Assignments
            </h2>
            <EmployeeFilter
              v-model="employeeFilter"
              :options="employeeOptions"
            />
          </div>
          <AssignmentsTable
            :rows="filteredRows"
            :totals="filteredTotals"
          />
        </section>
      </template>

      <!-- Replaces the cards, workload and table: there is nothing to show for an unsolvable instance. -->
      <InfeasibleNotice
        v-else-if="infeasible"
        :task-ids="infeasible.unassignableTaskIds"
      />
    </div>
  </div>
</template>
