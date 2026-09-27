import { nextAlertZone, shouldAlert, type AlertZone } from './alerts'
import type { MoveAlert, PairPrice } from './types'

export function roundPercent(percent: number): number {
  const rounded = Math.round((Math.abs(percent) + Number.EPSILON) * 100) / 100
  return percent < 0 && rounded !== 0 ? -rounded : rounded
}

export function checkAlert(
  symbol: string,
  zone: AlertZone,
  price: PairPrice,
  now: number,
): { zone: AlertZone; alert: MoveAlert | null } {
  const changePercent = roundPercent(price.changePercent)
  const next = nextAlertZone(zone, changePercent)
  if (next === 'calm' || !shouldAlert(zone, next)) return { zone: next, alert: null }

  return {
    zone: next,
    alert: {
      kind: 'move',
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
