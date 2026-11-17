import type { AssignmentInput, AssignmentResponse } from '#shared/types/assignment'
import { validationMessages } from '~/utils/errors'

/**
 * Re-runs the optimization on an edited/uploaded dataset (POST through the Nuxt server).
 * `result` is null while the bundled sample is shown.
 */
export function useDatasetRun() {
  const result = shallowRef<AssignmentResponse | null>(null)
  const pending = ref(false)
  const errors = ref<string[]>([])

  async function run(dataset: AssignmentInput): Promise<void> {
    pending.value = true
    errors.value = []

    try {
      result.value = await $fetch<AssignmentResponse>('/api/assignments', { method: 'POST', body: dataset })
    }
    catch (error) {
      errors.value = validationMessages(error)
    }
    finally {
      pending.value = false
    }
  }

  function reset(): void {
    result.value = null
    errors.value = []
  }

  return { result, pending, errors, run, reset }
}
