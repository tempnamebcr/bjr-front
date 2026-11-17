import type { AssignmentResponse, Variant, VariantResult } from '../types/assignment'
import { VARIANTS } from '../types/assignment'

/**
 * Runtime check of the backend contract. TypeScript types vanish at runtime, so the
 * Nuxt server uses this to refuse a response that drifted from the expected shape.
 */

type Json = Record<string, unknown>

const isObject = (v: unknown): v is Json => typeof v === 'object' && v !== null && !Array.isArray(v)
const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const isNumberArray = (v: unknown): v is number[] => Array.isArray(v) && v.every(isNumber)
const isListOf = (v: unknown, keys: readonly string[]): boolean =>
  Array.isArray(v) && v.every(item => isObject(item) && keys.every(key => isNumber(item[key])))

export const isVariant = (v: unknown): v is Variant => VARIANTS.includes(v as Variant)

export function isVariantResult(v: unknown): v is VariantResult {
  if (!isObject(v) || !isVariant(v.variant) || !isObject(v.meta) || !isNumberArray(v.unassignableTaskIds)) {
    return false
  }

  if (v.status === 'feasible') {
    return isNumber(v.totalPrice)
      && isNumber(v.makespan)
      && isNumber(v.meta.lowerBound)
      && typeof v.meta.provenOptimal === 'boolean'
      && isListOf(v.assignments, ['taskId', 'employeeId', 'start', 'end'])
      && isListOf(v.employees, ['employeeId', 'totalAssignedHours'])
  }

  if (v.status === 'infeasible') {
    return v.totalPrice === null
      && v.makespan === null
      && Array.isArray(v.assignments) && v.assignments.length === 0
      && v.unassignableTaskIds.length > 0
  }

  return false
}

export function isAssignmentResponse(v: unknown): v is AssignmentResponse {
  if (!isObject(v) || !isObject(v.input) || !isObject(v.variants)) {
    return false
  }

  return isListOf(v.input.employees, ['employeeId', 'skillLevel', 'hourlyRate'])
    && isListOf(v.input.tasks, ['taskId', 'skillLevel', 'estimation'])
    && Object.entries(v.variants).every(([key, result]) => isVariant(key) && isVariantResult(result) && result.variant === key)
}
