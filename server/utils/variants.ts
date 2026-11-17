import type { AssignmentResponse, Variant } from '#shared/types/assignment'
import { VARIANTS } from '#shared/types/assignment'
import { isVariant } from '#shared/utils/assignment-guards'

/**
 * `?variant=` → the variants to return. Missing or "all" → every variant; anything else → null (invalid).
 */
export function parseVariantQuery(value: unknown): Variant[] | null {
  if (value === undefined || value === 'all') {
    return [...VARIANTS]
  }

  return isVariant(value) ? [value] : null
}

/** Keeps only the requested variants (used by mock mode, which always holds both). */
export function pickVariants(response: AssignmentResponse, variants: readonly Variant[]): AssignmentResponse {
  const picked: AssignmentResponse['variants'] = {}

  for (const variant of variants) {
    const result = response.variants[variant]
    if (result) {
      picked[variant] = result
    }
  }

  return { input: response.input, variants: picked }
}
