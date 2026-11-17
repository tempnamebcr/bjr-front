import type { AssignmentResponse } from '#shared/types/assignment'

/**
 * Loads both variants once from Nuxt's own server route (never from Laravel directly),
 * so switching tabs and comparing variants need no extra requests. SSR-friendly via useFetch.
 */
export function useAssignments() {
  return useFetch<AssignmentResponse>('/api/assignments', {
    key: 'assignments',
    query: { variant: 'all' },
  })
}
