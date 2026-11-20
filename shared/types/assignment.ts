/**
 * API contract of the Laravel backend (bjr-api).
 * Mirrors App\Http\Resources\AssignmentResponseResource / AssignmentResultResource.
 * Kept in sync by: the mock file is generated from the backend CLI (`assignment:solve --json`),
 * a Vitest test checks it against isAssignmentResponse(), and the Nuxt server rejects
 * backend responses that don't match (502).
 */

export type Variant = 'cost' | 'makespan'

export const VARIANTS: readonly Variant[] = ['cost', 'makespan']

export interface Employee {
  employeeId: number
  skillLevel: number
  hourlyRate: number
}

export interface Task {
  taskId: number
  skillLevel: number
  estimation: number
}

/** One task on one employee's timeline, in hours from t = 0. */
export interface Assignment {
  taskId: number
  employeeId: number
  start: number
  end: number
}

export interface EmployeeLoad {
  employeeId: number
  totalAssignedHours: number
}

export interface FeasibleResult {
  variant: Variant
  status: 'feasible'
  assignments: Assignment[]
  totalPrice: number
  makespan: number
  /** Every employee, idle ones with 0 hours. */
  employees: EmployeeLoad[]
  unassignableTaskIds: []
  /** makespanProvenOptimal: makespan == lowerBound, so no schedule finishes earlier. Says nothing about cost. */
  meta: { lowerBound: number, makespanProvenOptimal: boolean }
}

export interface InfeasibleResult {
  variant: Variant
  status: 'infeasible'
  assignments: []
  totalPrice: null
  makespan: null
  employees: []
  unassignableTaskIds: number[]
  meta: { lowerBound: null, makespanProvenOptimal: false }
}

/** Discriminated on `status`: checking it narrows the type in code and templates. */
export type VariantResult = FeasibleResult | InfeasibleResult

export interface AssignmentInput {
  employees: Employee[]
  tasks: Task[]
}

export interface AssignmentResponse {
  input: AssignmentInput
  /** Only the requested variants are present. */
  variants: Partial<Record<Variant, VariantResult>>
}

/** POST body: solve a custom dataset. */
export interface SolveRequest extends AssignmentInput {
  variants?: Variant[]
}
