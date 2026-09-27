import { roundPercent } from './alertCheck'
import type { Direction } from './types'

export function changeTrend(changePercent: number): Direction {
  const shown = roundPercent(changePercent)
  if (shown > 0) return 'up'
  if (shown < 0) return 'down'
  return 'flat'
}
