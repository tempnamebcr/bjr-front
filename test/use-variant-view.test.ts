import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import type { AssignmentResponse, Variant } from '#shared/types/assignment'
import { useVariantView } from '~/composables/useVariantView'
import mockResults from '../server/mock/mock-results.json'

const sample = mockResults as AssignmentResponse

describe('useVariantView', () => {
  it('derives the selected variant and reacts to switching', () => {
    const variant = ref<Variant>('cost')
    const view = useVariantView(ref(sample), variant, ref(null))

    expect(view.summary.value?.makespan).toBe(51)
    expect(view.rows.value).toHaveLength(30)

    variant.value = 'makespan'

    expect(view.summary.value?.makespan).toBe(11)
    expect(view.workload.value.filter(bar => bar.isIdle).map(bar => bar.employeeId)).toEqual([5, 6])
  })

  it('filters rows by employee without touching the full list', () => {
    const filter = ref<number | null>(8)
    const view = useVariantView(ref(sample), ref<Variant>('cost'), filter)

    expect(view.filteredRows.value.every(row => row.employeeId === 8)).toBe(true)
    expect(view.filteredRows.value).toHaveLength(10)
    expect(view.filteredTotals.value).toEqual({ hours: 27, cost: 2160 }) // 27 h × 80
    expect(view.employeeOptions.value).toEqual([4, 8])

    filter.value = null

    expect(view.filteredRows.value).toHaveLength(30)
  })

  it('exposes an infeasible result instead of table data', () => {
    const response = ref<AssignmentResponse>({
      input: sample.input,
      variants: {
        cost: {
          variant: 'cost',
          status: 'infeasible',
          assignments: [],
          totalPrice: null,
          makespan: null,
          employees: [],
          unassignableTaskIds: [4, 7],
          meta: { lowerBound: null, makespanProvenOptimal: false },
        },
      },
    })
    const view = useVariantView(response, ref<Variant>('cost'), ref(null))

    expect(view.infeasible.value?.unassignableTaskIds).toEqual([4, 7])
    expect(view.feasible.value).toBeNull()
    expect(view.rows.value).toEqual([])
    expect(view.summary.value).toBeNull()
    expect(view.comparison.value).toBeNull()
  })

  it('handles data that has not loaded yet', () => {
    const view = useVariantView(ref(null), ref<Variant>('cost'), ref(null))

    expect(view.result.value).toBeNull()
    expect(view.workload.value).toEqual([])
  })
})
