import { computed } from 'vue'
import type { Ref } from 'vue'
import type { AssignmentResponse, FeasibleResult, InfeasibleResult, Variant } from '#shared/types/assignment'
import {
  assignedEmployeeIds,
  axisTicks,
  buildTimeline,
  buildWorkload,
  compareVariants,
  filterRowsByEmployee,
  joinAssignments,
  sumRows,
  summarize,
} from '~/utils/assignment'

/**
 * Everything the dashboard shows for the selected variant, as computed properties.
 * Components receive these values via props and never derive data themselves.
 */
export function useVariantView(
  response: Ref<AssignmentResponse | null | undefined>,
  variant: Ref<Variant>,
  employeeFilter: Ref<number | null>,
) {
  const result = computed(() => response.value?.variants[variant.value] ?? null)

  const feasible = computed<FeasibleResult | null>(() =>
    result.value?.status === 'feasible' ? result.value : null)

  const infeasible = computed<InfeasibleResult | null>(() =>
    result.value?.status === 'infeasible' ? result.value : null)

  const rows = computed(() =>
    feasible.value && response.value ? joinAssignments(feasible.value, response.value.input) : [])

  const filteredRows = computed(() => filterRowsByEmployee(rows.value, employeeFilter.value))

  const filteredTotals = computed(() => sumRows(filteredRows.value))

  const employeeOptions = computed(() => (feasible.value ? assignedEmployeeIds(feasible.value) : []))

  const summary = computed(() => (feasible.value ? summarize(feasible.value) : null))

  const workload = computed(() => (feasible.value ? buildWorkload(feasible.value) : []))

  const timeline = computed(() =>
    feasible.value && response.value ? buildTimeline(feasible.value, response.value.input) : [])

  const ticks = computed(() => (feasible.value ? axisTicks(feasible.value.makespan) : []))

  const comparison = computed(() =>
    compareVariants(response.value?.variants.cost, response.value?.variants.makespan))

  return { result, feasible, infeasible, rows, filteredRows, filteredTotals, employeeOptions, summary, workload, timeline, ticks, comparison }
}
