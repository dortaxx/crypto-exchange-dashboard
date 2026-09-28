import { AlertList, type AlertView } from '../components/AlertList/AlertList'
import { PAIR_CATALOG } from '../config/pairs'
import { formatPrice, formatTime } from '../domain/format'
import type { PriceAlert } from '../domain/types'
import { useMarketStore } from '../store/marketStore'
import { usePreferencesStore } from '../store/preferencesStore'

function toView(alert: PriceAlert): AlertView {
  const pair = PAIR_CATALOG.find((candidate) => candidate.symbol === alert.symbol)
  const label = pair ? `${pair.name} (${pair.base}/${pair.quote})` : alert.symbol
  const common = { id: alert.id, direction: alert.direction, time: formatTime(alert.triggeredAt) }

  switch (alert.kind) {
    case 'move': {
      const verb = alert.direction === 'up' ? 'increased' : 'decreased'
      return {
        ...common,
        message: `${label} ${verb} by ${Math.abs(alert.changePercent).toFixed(2)}% since you opened the page`,
        prices: `${formatPrice(alert.startPrice)} → ${formatPrice(alert.price)} USDT`,
      }
    }
    case 'target': {
      const verb = alert.direction === 'up' ? 'rose above' : 'fell below'
      return {
        ...common,
        message: `${label} ${verb} your target of ${formatPrice(alert.targetPrice)} USDT`,
        prices: `Target ${formatPrice(alert.targetPrice)} → reached ${formatPrice(alert.price)} USDT`,
      }
    }
  }
}

export function AlertsContainer() {
  const alerts = useMarketStore((state) => state.alerts)
  const dismissAlert = useMarketStore((state) => state.dismissAlert)
  const waitingTargets = usePreferencesStore((state) => state.targets.length)

  return (
    <AlertList
      alerts={alerts.map(toView)}
      waitingTargets={waitingTargets}
      onDismiss={dismissAlert}
    />
  )
}
