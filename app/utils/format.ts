// Fixed locale: server and client must render identical strings, or hydration mismatches.
const LOCALE = 'en-US'

const number = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 2 })
const money = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const percent = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 })

/** The brief has no currency, so prices are plain amounts: 17460 → "17,460.00". */
export const formatPrice = (value: number): string => money.format(value)

/** 11 → "11 h", 1.5 → "1.5 h" */
export const formatHours = (value: number): string => `${number.format(value)} h`

export const formatNumber = (value: number): string => number.format(value)

export const formatPercent = (value: number): string => `${percent.format(value)}%`
