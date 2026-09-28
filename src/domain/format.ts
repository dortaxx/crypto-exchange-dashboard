import { roundPercent } from './alertCheck'

const byDecimals = new Map<number, Intl.NumberFormat>()

function withDecimals(digits: number): Intl.NumberFormat {
  let format = byDecimals.get(digits)
  if (format === undefined) {
    format = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })
    byDecimals.set(digits, format)
  }
  return format
}

function priceDecimals(price: number): number {
  if (price >= 10) return 2
  if (price >= 1) return 4
  return 6
}

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

export function formatPercent(percent: number): string {
  return signedPercent.format(roundPercent(percent) / 100)
}

export function formatPrice(price: number): string {
  return withDecimals(priceDecimals(price)).format(price)
}
