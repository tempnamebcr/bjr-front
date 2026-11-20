import { describe, expect, it } from 'vitest'
import type { AssignmentInput, AssignmentResponse, FeasibleResult, InfeasibleResult } from '#shared/types/assignment'
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
import mockResults from '../server/mock/mock-results.json'

// Employee 1 (skill 1, 100/h) does tasks 1 and 3; employee 2 (skill 2, 400/h) does task 2; employee 3 is idle.
const input: AssignmentInput = {
  employees: [
    { employeeId: 1, skillLevel: 1, hourlyRate: 100 },
    { employeeId: 2, skillLevel: 2, hourlyRate: 400 },
    { employeeId: 3, skillLevel: 1, hourlyRate: 50 },
  ],
  tasks: [
    { taskId: 1, skillLevel: 1, estimation: 2 },
    { taskId: 2, skillLevel: 2, estimation: 3 },
    { taskId: 3, skillLevel: 1, estimation: 1.5 },
  ],
}

const result: FeasibleResult = {
  variant: 'cost',
  status: 'feasible',
  assignments: [
    { taskId: 1, employeeId: 1, start: 0, end: 2 },
    { taskId: 2, employeeId: 2, start: 0, end: 3 },
    { taskId: 3, employeeId: 1, start: 2, end: 3.5 },
  ],
  totalPrice: 1550,
  makespan: 3.5,
  employees: [
    { employeeId: 1, totalAssignedHours: 3.5 },
    { employeeId: 2, totalAssignedHours: 3 },
    { employeeId: 3, totalAssignedHours: 0 },
  ],
  unassignableTaskIds: [],
  meta: { lowerBound: 3, makespanProvenOptimal: false },
}

const infeasible: InfeasibleResult = {
  variant: 'makespan',
  status: 'infeasible',
  assignments: [],
  totalPrice: null,
  makespan: null,
  employees: [],
  unassignableTaskIds: [2],
  meta: { lowerBound: null, makespanProvenOptimal: false },
}

describe('joinAssignments', () => {
  it('joins task and employee data and computes the task cost', () => {
    expect(joinAssignments(result, input)).toEqual([
      { taskId: 1, requiredSkill: 1, hours: 2, employeeId: 1, employeeSkill: 1, hourlyRate: 100, taskCost: 200 },
      { taskId: 2, requiredSkill: 2, hours: 3, employeeId: 2, employeeSkill: 2, hourlyRate: 400, taskCost: 1200 },
      { taskId: 3, requiredSkill: 1, hours: 1.5, employeeId: 1, employeeSkill: 1, hourlyRate: 100, taskCost: 150 },
    ])
  })

  it('throws when an assignment references an unknown task', () => {
    const broken = { ...result, assignments: [{ taskId: 99, employeeId: 1, start: 0, end: 1 }] }

    expect(() => joinAssignments(broken, input)).toThrow('task 99')
  })

  it.each(['cost', 'makespan'] as const)('row costs add up to the backend total price (%s, sample data)', (variant) => {
    const response = mockResults as AssignmentResponse
    const sample = response.variants[variant] as FeasibleResult

    const sum = joinAssignments(sample, response.input).reduce((total, row) => total + row.taskCost, 0)

    expect(sum).toBeCloseTo(sample.totalPrice, 2)
  })
})

describe('filterRowsByEmployee', () => {
  const rows = joinAssignments(result, input)

  it('keeps only the selected employee', () => {
    expect(filterRowsByEmployee(rows, 1).map(row => row.taskId)).toEqual([1, 3])
  })

  it('returns everything for null', () => {
    expect(filterRowsByEmployee(rows, null)).toHaveLength(3)
  })
})

describe('sumRows', () => {
  it('totals hours and cost of the given rows', () => {
    const rows = joinAssignments(result, input)

    expect(sumRows(rows)).toEqual({ hours: 6.5, cost: 1550 })
    expect(sumRows(filterRowsByEmployee(rows, 1))).toEqual({ hours: 3.5, cost: 350 })
    expect(sumRows([])).toEqual({ hours: 0, cost: 0 })
  })
})

describe('summarize', () => {
  it('counts tasks and employees with work', () => {
    expect(summarize(result)).toEqual({ totalPrice: 1550, makespan: 3.5, taskCount: 3, activeEmployeeCount: 2, employeeCount: 3 })
  })

  it('matches the sample data', () => {
    const sample = (mockResults as AssignmentResponse).variants.cost as FeasibleResult

    expect(summarize(sample)).toEqual({ totalPrice: 17460, makespan: 51, taskCount: 30, activeEmployeeCount: 2, employeeCount: 10 })
  })
})

describe('assignedEmployeeIds', () => {
  it('lists employees with work, ascending', () => {
    expect(assignedEmployeeIds(result)).toEqual([1, 2])
  })
})

describe('buildWorkload', () => {
  it('scales bars to the makespan and flags critical and idle employees', () => {
    const bars = buildWorkload(result)

    expect(bars).toHaveLength(3)
    expect(bars[0]).toEqual({ employeeId: 1, hours: 3.5, percent: 100, isCritical: true, isIdle: false })
    expect(bars[1]!.percent).toBeCloseTo(85.71, 2)
    expect(bars[1]!.isCritical).toBe(false)
    expect(bars[2]).toEqual({ employeeId: 3, hours: 0, percent: 0, isCritical: false, isIdle: true })
  })

  it('marks every employee that reaches the makespan as critical', () => {
    const sample = (mockResults as AssignmentResponse).variants.makespan as FeasibleResult

    // Sample min-makespan: employees 3, 4 and 8 all finish at 11 h.
    expect(buildWorkload(sample).filter(bar => bar.isCritical).map(bar => bar.employeeId)).toEqual([3, 4, 8])
  })
})

describe('buildTimeline', () => {
  it('places each task as a block on its employee lane, idle lanes empty', () => {
    const lanes = buildTimeline(result, input)

    expect(lanes.map(lane => lane.employeeId)).toEqual([1, 2, 3])
    expect(lanes[0]!.blocks).toEqual([
      { taskId: 1, requiredSkill: 1, start: 0, end: 2, leftPercent: 0, widthPercent: (2 / 3.5) * 100 },
      { taskId: 3, requiredSkill: 1, start: 2, end: 3.5, leftPercent: (2 / 3.5) * 100, widthPercent: (1.5 / 3.5) * 100 },
    ])
    expect(lanes[1]!.blocks[0]!.requiredSkill).toBe(2)
    expect(lanes[2]!.blocks).toEqual([])
  })

  it('blocks of one lane never overlap and end at the employee load (sample data)', () => {
    const response = mockResults as AssignmentResponse
    const sample = response.variants.makespan as FeasibleResult

    for (const lane of buildTimeline(sample, response.input)) {
      lane.blocks.forEach((block, i) => {
        expect(block.start).toBe(i === 0 ? 0 : lane.blocks[i - 1]!.end)
      })
      const load = sample.employees.find(e => e.employeeId === lane.employeeId)!.totalAssignedHours
      expect(lane.blocks.at(-1)?.end ?? 0).toBe(load)
    }
  })
})

describe('axisTicks', () => {
  it('picks a round step with at most 12 intervals', () => {
    expect(axisTicks(11).map(t => t.hour)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    expect(axisTicks(51).map(t => t.hour)).toEqual([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50])
    expect(axisTicks(3.5).map(t => t.hour)).toEqual([0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5])
  })

  it('positions ticks as a share of the makespan', () => {
    expect(axisTicks(10).at(-1)).toEqual({ hour: 10, percent: 100 })
    expect(axisTicks(51)[1]!.percent).toBeCloseTo((5 / 51) * 100)
  })

  it('handles an empty schedule', () => {
    expect(axisTicks(0)).toEqual([{ hour: 0, percent: 0 }])
  })
})

describe('compareVariants', () => {
  it('computes the price and makespan differences (sample data)', () => {
    const { cost, makespan } = (mockResults as AssignmentResponse).variants

    expect(compareVariants(cost, makespan)).toEqual({
      cost: { totalPrice: 17460, makespan: 51 },
      makespan: { totalPrice: 25050, makespan: 11 },
      extraPrice: 7590,
      extraPricePercent: (7590 / 17460) * 100,
      hoursSaved: 40,
      hoursSavedPercent: (40 / 51) * 100,
    })
  })

  it('is null when a variant is missing or infeasible', () => {
    expect(compareVariants(result, undefined)).toBeNull()
    expect(compareVariants(result, infeasible)).toBeNull()
  })
})
