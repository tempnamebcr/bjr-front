import type { H3Event } from 'h3'
import type { AssignmentResponse, SolveRequest, Variant } from '#shared/types/assignment'
import { isAssignmentResponse } from '#shared/utils/assignment-guards'
import mockResults from '../mock/mock-results.json'

/**
 * Where assignment results come from: the Laravel backend, or the bundled mock when
 * NUXT_USE_MOCK=true. Both routes go through here so mock and real mode can't diverge.
 */
export async function solveAssignments(
  event: H3Event,
  variants: Variant[],
  dataset?: Omit<SolveRequest, 'variants'>,
): Promise<AssignmentResponse> {
  if (useRuntimeConfig(event).useMock) {
    // Mock mode can't solve custom datasets; it always answers with the sample results.
    return pickVariants(mockResults as AssignmentResponse, variants)
  }

  const data = dataset
    ? await callBackend(event, '/api/v1/assignments', { method: 'POST', body: { ...dataset, variants } })
    : await callBackend(event, '/api/v1/assignments', { query: { variant: variants.length === 1 ? variants[0]! : 'all' } })

  // Types don't exist at runtime: refuse a backend response that drifted from the contract.
  if (!isAssignmentResponse(data)) {
    throw createError({ statusCode: 502, statusMessage: 'Unexpected backend response', message: 'The assignment service returned data in an unexpected format.' })
  }

  return data
}
