import { describe, expect, it } from 'vitest'
import { parseDataset, toJson } from '~/utils/dataset'
import { validationMessages } from '~/utils/errors'

describe('parseDataset', () => {
  const employees = toJson([{ employeeId: 1, skillLevel: 1, hourlyRate: 100 }])
  const tasks = toJson([{ taskId: 1, skillLevel: 1, estimation: 2 }])

  it('parses two JSON arrays into a dataset', () => {
    expect(parseDataset(employees, tasks)).toEqual({
      ok: true,
      dataset: {
        employees: [{ employeeId: 1, skillLevel: 1, hourlyRate: 100 }],
        tasks: [{ taskId: 1, skillLevel: 1, estimation: 2 }],
      },
    })
  })

  it('reports invalid JSON per field', () => {
    const parsed = parseDataset(employees, '[{ "taskId": 1,, }]')

    expect(parsed.ok).toBe(false)
    expect(!parsed.ok && parsed.error).toMatch(/^Tasks: invalid JSON/)
  })

  it('requires arrays', () => {
    expect(parseDataset('{"employeeId": 1}', tasks)).toEqual({ ok: false, error: 'Employees must be a JSON array.' })
  })

  it('leaves field rules to the backend', () => {
    // Skill 0 is invalid, but that is Laravel's call: it returns a 422 shown in the editor.
    expect(parseDataset(toJson([{ employeeId: 1, skillLevel: 0, hourlyRate: 100 }]), tasks).ok).toBe(true)
  })
})

describe('validationMessages', () => {
  it('lists Laravel field errors passed through by the Nuxt server', () => {
    // Shape of the client-side FetchError: h3 error body with Laravel's 422 body inside `data`.
    const error = {
      statusCode: 422,
      data: {
        statusCode: 422,
        statusMessage: 'Unprocessable Content',
        data: {
          message: 'The tasks.0.estimation field must be greater than 0. (and 1 more error)',
          errors: {
            'employees.0.skillLevel': ['The employees.0.skillLevel field must be at least 1.'],
            'tasks.0.estimation': ['The tasks.0.estimation field must be greater than 0.'],
          },
        },
      },
    }

    expect(validationMessages(error)).toEqual([
      'employees.0.skillLevel: The employees.0.skillLevel field must be at least 1.',
      'tasks.0.estimation: The tasks.0.estimation field must be greater than 0.',
    ])
  })

  it('falls back to a single readable message', () => {
    const error = { statusCode: 502, data: { message: 'The assignment service could not be reached. Is the backend running?' } }

    expect(validationMessages(error)).toEqual(['The assignment service could not be reached. Is the backend running?'])
  })
})
