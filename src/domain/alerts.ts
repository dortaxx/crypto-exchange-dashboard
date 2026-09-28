export type AlertZone = 'calm' | 'up' | 'down'

export const ALERT_AT_PERCENT = 2
export const CALM_BELOW_PERCENT = 1.5

export function nextAlertZone(zone: AlertZone, changePercent: number): AlertZone {
  if (changePercent >= ALERT_AT_PERCENT) {
    return 'up'
  } else if (changePercent <= -ALERT_AT_PERCENT) {
    return 'down'
  } else if (changePercent > -CALM_BELOW_PERCENT && changePercent < CALM_BELOW_PERCENT) {
    return 'calm'
  } else {
    return zone
  }
}

export function shouldAlert(before: AlertZone, after: AlertZone): boolean {
  return after !== 'calm' && after !== before
}
