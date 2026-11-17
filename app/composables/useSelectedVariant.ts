import type { Variant } from '#shared/types/assignment'
import { isVariant } from '#shared/utils/assignment-guards'

const DEFAULT_VARIANT: Variant = 'cost'

/**
 * The selected variant lives in the URL (?variant=cost|makespan), so it survives reloads and
 * can be shared. A missing or unknown value falls back to the default.
 */
export function useSelectedVariant() {
  const route = useRoute()
  const router = useRouter()

  return computed<Variant>({
    get: () => {
      const value = route.query.variant
      return isVariant(value) ? value : DEFAULT_VARIANT
    },
    set: (variant) => {
      // replace, not push: switching tabs shouldn't flood the back button.
      router.replace({ query: { ...route.query, variant } })
    },
  })
}
