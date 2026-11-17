import type { SolveRequest } from '#shared/types/assignment'
import { VARIANTS } from '#shared/types/assignment'

/**
 * POST /api/assignments — solve an edited/uploaded dataset.
 * The body is forwarded as-is: Laravel is the single source of validation, and its 422
 * field errors are passed back to the UI unchanged.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<SolveRequest>>(event)

  if (typeof body !== 'object' || body === null) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body', message: 'Expected a JSON object with employees and tasks.' })
  }

  const { variants, ...dataset } = body

  return solveAssignments(event, variants ?? [...VARIANTS], dataset as Omit<SolveRequest, 'variants'>)
})
