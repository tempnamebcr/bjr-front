import { describe, expect, it } from 'vitest'
import { describeError, isRetryable } from '~/utils/errors'
import { formatHours, formatPercent, formatPrice } from '~/utils/format'

describe('format', () => {
  it('formats prices with two decimals and separators', () => {
    expect(formatPrice(17460)).toBe('17,460.00')
    expect(formatPrice(49.995)).toBe('50.00')
  })

  it('formats hours without trailing zeros', () => {
    expect(formatHours(11)).toBe('11 h')
    expect(formatHours(1.5)).toBe('1.5 h')
  })

  it('formats percentages with one decimal', () => {
    expect(formatPercent(43.47079)).toBe('43.5%')
  })
})

describe('describeError', () => {
  it('prefers the readable message from the Nuxt server', () => {
    const error = { statusCode: 502, message: '[GET] "/api/assignments": 502', data: { message: 'The assignment service could not be reached. Is the backend running?' } }

    expect(describeError(error)).toBe('The assignment service could not be reached. Is the backend running?')
  })

  it('falls back to the status message, then the error message', () => {
    expect(describeError({ data: { statusMessage: 'Bad Gateway' } })).toBe('Bad Gateway')
    expect(describeError({ message: 'Network error' })).toBe('Network error')
  })

  it('has a generic message for anything else', () => {
    expect(describeError(null)).toBe('Something went wrong while loading the assignments.')
  })
})

describe('isRetryable', () => {
  it.each([
    [{ statusCode: 502 }, true],
    [{ statusCode: 500 }, true],
    [{}, true],
    [{ statusCode: 400 }, false],
    [{ statusCode: 422 }, false],
  ])('%j → %s', (error, expected) => {
    expect(isRetryable(error)).toBe(expected)
  })
})
