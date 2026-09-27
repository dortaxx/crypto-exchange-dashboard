import { nextAlertZone, shouldAlert, type AlertZone } from './alerts'
import type { PairPrice, PriceAlert } from './types'

export function roundPercent(percent: number): number {
  return Math.round(percent * 100) / 100
}

export function checkAlert(
  symbol: string,
  zone: AlertZone,
  price: PairPrice,
  now: number,
): { zone: AlertZone; alert: PriceAlert | null } {
  const changePercent = roundPercent(price.changePercent)
  const next = nextAlertZone(zone, changePercent)
  if (next === 'calm' || !shouldAlert(zone, next)) return { zone: next, alert: null }

  return {
    zone: next,
    alert: {
      id: `${symbol}-${now}`,
      symbol,
      direction: next,
      startPrice: price.startPrice,
      price: price.price,
      changePercent,
      triggeredAt: now,
    },
  }
}
