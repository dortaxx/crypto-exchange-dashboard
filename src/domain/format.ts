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
  return signedPercent.format(percent / 100)
}

export function formatPrice(price: number): string {
  if (price >= 10) return twoDecimals.format(price)
  if (price >= 1) return fourDecimals.format(price)
  return sixDecimals.format(price)
}
