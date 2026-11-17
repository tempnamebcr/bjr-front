import { describe, expect, it } from 'vitest'
import type { AssignmentResponse } from '#shared/types/assignment'
import { parseVariantQuery, pickVariants } from '../server/utils/variants'
import mockResults from '../server/mock/mock-results.json'

const response = mockResults as AssignmentResponse

describe('parseVariantQuery', () => {
  it.each([
    [undefined, ['cost', 'makespan']],
    ['all', ['cost', 'makespan']],
    ['cost', ['cost']],
    ['makespan', ['makespan']],
  ])('%s → %j', (query, expected) => {
    expect(parseVariantQuery(query)).toEqual(expected)
  })

  it.each([['fastest'], [''], [['cost', 'makespan']]])('rejects %j', (query) => {
    expect(parseVariantQuery(query)).toBeNull()
  })
})

describe('pickVariants', () => {
  it('keeps only the requested variants and the input', () => {
    const picked = pickVariants(response, ['makespan'])

    expect(Object.keys(picked.variants)).toEqual(['makespan'])
    expect(picked.input).toBe(response.input)
  })

  it('returns every requested variant that exists', () => {
    expect(Object.keys(pickVariants(response, ['cost', 'makespan']).variants)).toEqual(['cost', 'makespan'])
  })
})
