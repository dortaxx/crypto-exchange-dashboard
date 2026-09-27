import { roundPercent } from './alertCheck'

const withDecimals = (digits: number) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })

const twoDecimals = withDecimals(2)
const fourDecimals = withDecimals(4)
const sixDecimals = withDecimals(6)

const signedPercent = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'exceptZero',
})

const eightSignificant = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 8 })

export function formatAmount(amount: number): string {
  return eightSignificant.format(amount)
}

const clockTime = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

export function formatTime(timestamp: number): string {
  return clockTime.format(timestamp)
}

const hourMinute = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' })

export function formatShortTime(timestamp: number): string {
  return hourMinute.format(timestamp)
}

export function formatPercent(percent: number): string {
  return signedPercent.format(roundPercent(percent) / 100)
}

export function formatPrice(price: number): string {
  if (price >= 10) return twoDecimals.format(price)
  if (price >= 1) return fourDecimals.format(price)
  return sixDecimals.format(price)
}

const byDecimals = new Map<number, Intl.NumberFormat>()

function priceDecimals(price: number): number {
  if (price >= 10) return 2
  if (price >= 1) return 4
  return 6
}

export function formatAxisPrice(price: number, step: number): string {
  const stepDecimals = Math.max(0, Math.ceil(-Math.log10(step) - 1e-9))
  const digits = Math.min(8, Math.max(priceDecimals(price), stepDecimals))
  let format = byDecimals.get(digits)
  if (format === undefined) {
    format = withDecimals(digits)
    byDecimals.set(digits, format)
  }
  return format.format(price)
}
