const withDecimals = (digits: number) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })

const twoDecimals = withDecimals(2)
const fourDecimals = withDecimals(4)
const sixDecimals = withDecimals(6)

export function formatPrice(price: number): string {
  if (price >= 10) return twoDecimals.format(price)
  if (price >= 1) return fourDecimals.format(price)
  return sixDecimals.format(price)
}
