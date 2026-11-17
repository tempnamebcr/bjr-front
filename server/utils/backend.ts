import type { H3Event } from 'h3'

interface BackendRequest {
  method?: 'GET' | 'POST'
  query?: Record<string, string>
  body?: Record<string, unknown>
}

/** Shape of ofetch's FetchError we rely on; duck-typed so ofetch isn't a direct dependency. */
interface FetchFailure {
  response?: { status: number, statusText: string }
  data?: unknown
}

const TIMEOUT_MS = 10_000

/**
 * The only place that talks to Laravel. The browser never sees the backend URL.
 *
 * - Backend answered with an error (e.g. 422 validation): pass status and body through,
 *   so the UI can show the field errors.
 * - Backend didn't answer (down, DNS, timeout): 502 with a readable message.
 */
export async function callBackend(event: H3Event, path: string, request: BackendRequest = {}): Promise<unknown> {
  const { backendUrl } = useRuntimeConfig(event)

  try {
    return await $fetch(path, {
      baseURL: backendUrl,
      timeout: TIMEOUT_MS,
      headers: { accept: 'application/json' },
      ...request,
    })
  }
  catch (error) {
    const failure = error as FetchFailure

    if (failure.response) {
      throw createError({
        statusCode: failure.response.status,
        statusMessage: failure.response.statusText,
        data: failure.data,
      })
    }

    throw createError({
      statusCode: 502,
      statusMessage: 'Backend unreachable',
      message: 'The assignment service could not be reached. Is the backend running?',
    })
  }
}
