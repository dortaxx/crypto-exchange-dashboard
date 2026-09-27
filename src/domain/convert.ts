import type { PairPrice } from './types'

export const QUOTE_ASSET = 'USDT'

export function priceInUsdt(
  asset: string,
  prices: Readonly<Record<string, PairPrice>>,
): number | undefined {
  if (asset === QUOTE_ASSET) return 1
  return prices[`${asset}${QUOTE_ASSET}`]?.price
}

export function convert(amount: number, fromPriceUsdt: number, toPriceUsdt: number): number {
  return (amount * fromPriceUsdt) / toPriceUsdt
}
