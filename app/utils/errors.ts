/** Shape of the error useFetch exposes (an ofetch FetchError carrying h3's error body). */
interface FetchErrorLike {
  statusCode?: number
  data?: { message?: unknown, statusMessage?: unknown }
  message?: string
}

const FALLBACK = 'Something went wrong while loading the assignments.'

/**
 * Turns a fetch error into a sentence for the UI. The Nuxt server already writes readable
 * messages (e.g. "The assignment service could not be reached…"), so prefer those.
 */
export function describeError(error: unknown): string {
  if (typeof error !== 'object' || error === null) {
    return FALLBACK
  }

  const { data, message } = error as FetchErrorLike

  if (typeof data?.message === 'string' && data.message !== '') {
    return data.message
  }

  if (typeof data?.statusMessage === 'string' && data.statusMessage !== '') {
    return data.statusMessage
  }

  return message || FALLBACK
}

/** Backend down or misbehaving (5xx) is worth a retry; a 4xx means the request itself was wrong. */
export function isRetryable(error: unknown): boolean {
  const status = (error as FetchErrorLike | null)?.statusCode

  return status === undefined || status >= 500
}
