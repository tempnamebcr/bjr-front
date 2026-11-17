import type { AssignmentInput, Employee, Task } from '#shared/types/assignment'

export type ParsedDataset =
  | { ok: true, dataset: AssignmentInput }
  | { ok: false, error: string }

/**
 * Client-side check of the editor text: only JSON syntax and "is it a list".
 * Field rules (ids, skill ≥ 1, rate ≥ 0, …) are Laravel's job; its 422 errors are shown as-is,
 * so the rules live in exactly one place.
 */
export function parseDataset(employeesJson: string, tasksJson: string): ParsedDataset {
  const employees = parseList('Employees', employeesJson)
  if (!employees.ok) {
    return employees
  }

  const tasks = parseList('Tasks', tasksJson)
  if (!tasks.ok) {
    return tasks
  }

  return { ok: true, dataset: { employees: employees.list as Employee[], tasks: tasks.list as Task[] } }
}

export const toJson = (value: unknown): string => JSON.stringify(value, null, 2)

function parseList(label: string, json: string): { ok: true, list: unknown[] } | { ok: false, error: string } {
  let value: unknown

  try {
    value = JSON.parse(json)
  }
  catch (error) {
    return { ok: false, error: `${label}: invalid JSON (${(error as Error).message}).` }
  }

  return Array.isArray(value)
    ? { ok: true, list: value }
    : { ok: false, error: `${label} must be a JSON array.` }
}
