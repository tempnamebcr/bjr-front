import { describe, expect, it } from 'vitest'
import { isAssignmentResponse, isVariantResult } from '#shared/utils/assignment-guards'
import mockResults from '../server/mock/mock-results.json'

const infeasible = {
  variant: 'cost',
  status: 'infeasible',
  assignments: [],
  totalPrice: null,
  makespan: null,
  employees: [],
  unassignableTaskIds: [2, 5],
  meta: { lowerBound: null, makespanProvenOptimal: false },
}

describe('isAssignmentResponse', () => {
  it('accepts the mock file (generated from the backend CLI), so the mock matches the contract', () => {
    expect(isAssignmentResponse(mockResults)).toBe(true)
  })

  it('accepts a response with a single variant', () => {
    expect(isAssignmentResponse({ ...mockResults, variants: { cost: mockResults.variants.cost } })).toBe(true)
  })

  it('accepts an infeasible variant', () => {
    expect(isAssignmentResponse({ ...mockResults, variants: { cost: infeasible } })).toBe(true)
  })

  it('rejects a variant stored under the wrong key', () => {
    expect(isAssignmentResponse({ ...mockResults, variants: { makespan: mockResults.variants.cost } })).toBe(false)
  })

  it.each([
    ['null', null],
    ['missing input', { variants: {} }],
    ['employees with a string rate', { ...mockResults, input: { ...mockResults.input, employees: [{ employeeId: 1, skillLevel: 1, hourlyRate: '100' }] } }],
    ['unknown variant key', { ...mockResults, variants: { fastest: mockResults.variants.cost } }],
  ])('rejects %s', (_, value) => {
    expect(isAssignmentResponse(value)).toBe(false)
  })
})

describe('isVariantResult', () => {
  const feasible = mockResults.variants.makespan

  it.each([
    ['feasible without a price', { ...feasible, totalPrice: null }],
    ['infeasible with a price', { ...infeasible, totalPrice: 10 }],
    ['infeasible without unassignable tasks', { ...infeasible, unassignableTaskIds: [] }],
    ['an unknown status', { ...feasible, status: 'pending' }],
    ['an assignment missing its end', { ...feasible, assignments: [{ taskId: 1, employeeId: 1, start: 0 }] }],
  ])('rejects %s', (_, value) => {
    expect(isVariantResult(value)).toBe(false)
  })
})
