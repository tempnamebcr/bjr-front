import type { AssignmentInput, FeasibleResult, VariantResult } from '#shared/types/assignment'

/**
 * Pure derivations from the API response. No Vue, no Nuxt: unit-tested with plain Vitest
 * and wrapped in computed() by useVariantView. Templates only render what comes out of here.
 */

const EPSILON = 1e-9

/** One row of the assignments table: an assignment joined with its task and employee. */
export interface AssignmentRow {
  taskId: number
  requiredSkill: number
  hours: number
  employeeId: number
  employeeSkill: number
  hourlyRate: number
  /** hourlyRate × estimation */
  taskCost: number
}

export interface Summary {
  totalPrice: number
  makespan: number
  taskCount: number
  /** Employees with at least one task. */
  activeEmployeeCount: number
}

export interface WorkloadBar {
  employeeId: number
  hours: number
  /** Bar width: share of the makespan, 0–100. */
  percent: number
  /** Load equals the makespan: this employee finishes last. */
  isCritical: boolean
  isIdle: boolean
}

export interface TimelineBlock {
  taskId: number
  start: number
  end: number
  /** Position and width as a share of the makespan, 0–100. */
  leftPercent: number
  widthPercent: number
}

export interface TimelineLane {
  employeeId: number
  blocks: TimelineBlock[]
}

export interface VariantTotals {
  totalPrice: number
  makespan: number
}

export interface VariantComparison {
  cost: VariantTotals
  makespan: VariantTotals
  /** How much more the fastest schedule costs than the cheapest one. */
  extraPrice: number
  extraPricePercent: number
  /** How many hours earlier the fastest schedule finishes than the cheapest one. */
  hoursSaved: number
  hoursSavedPercent: number
}

/**
 * Joins each assignment with its task (required skill, hours) and employee (skill, rate).
 * Throws on unknown ids: that means the response is internally inconsistent.
 */
export function joinAssignments(result: FeasibleResult, input: AssignmentInput): AssignmentRow[] {
  const tasks = new Map(input.tasks.map(task => [task.taskId, task]))
  const employees = new Map(input.employees.map(employee => [employee.employeeId, employee]))

  return result.assignments.map((assignment) => {
    const task = tasks.get(assignment.taskId)
    const employee = employees.get(assignment.employeeId)

    if (!task || !employee) {
      throw new Error(`Assignment of task ${assignment.taskId} references unknown data.`)
    }

    return {
      taskId: task.taskId,
      requiredSkill: task.skillLevel,
      hours: task.estimation,
      employeeId: employee.employeeId,
      employeeSkill: employee.skillLevel,
      hourlyRate: employee.hourlyRate,
      taskCost: employee.hourlyRate * task.estimation,
    }
  })
}

/** `null` means "all employees". */
export function filterRowsByEmployee(rows: AssignmentRow[], employeeId: number | null): AssignmentRow[] {
  return employeeId === null ? rows : rows.filter(row => row.employeeId === employeeId)
}

/** Employees that have work in this result, ascending: the options of the employee filter. */
export function assignedEmployeeIds(result: FeasibleResult): number[] {
  return result.employees
    .filter(load => load.totalAssignedHours > 0)
    .map(load => load.employeeId)
    .sort((a, b) => a - b)
}

export function summarize(result: FeasibleResult): Summary {
  return {
    totalPrice: result.totalPrice,
    makespan: result.makespan,
    taskCount: result.assignments.length,
    activeEmployeeCount: assignedEmployeeIds(result).length,
  }
}

export function buildWorkload(result: FeasibleResult): WorkloadBar[] {
  return result.employees.map(({ employeeId, totalAssignedHours: hours }) => ({
    employeeId,
    hours,
    percent: toPercent(hours, result.makespan),
    isCritical: result.makespan > 0 && Math.abs(hours - result.makespan) < EPSILON,
    isIdle: hours === 0,
  }))
}

/** One lane per employee (idle ones empty), each task a block positioned on a 0…makespan scale. */
export function buildTimeline(result: FeasibleResult): TimelineLane[] {
  const lanes = new Map<number, TimelineBlock[]>(result.employees.map(load => [load.employeeId, []]))

  for (const { taskId, employeeId, start, end } of result.assignments) {
    lanes.get(employeeId)?.push({
      taskId,
      start,
      end,
      leftPercent: toPercent(start, result.makespan),
      widthPercent: toPercent(end - start, result.makespan),
    })
  }

  return [...lanes].map(([employeeId, blocks]) => ({
    employeeId,
    blocks: blocks.sort((a, b) => a.start - b.start),
  }))
}

/** Side-by-side numbers; null unless both variants are present and feasible. */
export function compareVariants(cost: VariantResult | undefined, makespan: VariantResult | undefined): VariantComparison | null {
  if (cost?.status !== 'feasible' || makespan?.status !== 'feasible') {
    return null
  }

  const extraPrice = makespan.totalPrice - cost.totalPrice
  const hoursSaved = cost.makespan - makespan.makespan

  return {
    cost: { totalPrice: cost.totalPrice, makespan: cost.makespan },
    makespan: { totalPrice: makespan.totalPrice, makespan: makespan.makespan },
    extraPrice,
    extraPricePercent: toPercent(extraPrice, cost.totalPrice),
    hoursSaved,
    hoursSavedPercent: toPercent(hoursSaved, cost.makespan),
  }
}

function toPercent(part: number, whole: number): number {
  return whole > 0 ? (part / whole) * 100 : 0
}
