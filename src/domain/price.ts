export function parsePrice(text: string): number | null {
  const price = Number(text)
  return Number.isFinite(price) && price > 0 ? price : null
}
