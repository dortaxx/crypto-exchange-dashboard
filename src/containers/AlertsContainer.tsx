import { AlertList, type AlertView } from '../components/AlertList/AlertList'
import { PAIR_CATALOG } from '../config/pairs'
import { formatPrice, formatTime } from '../domain/format'
import type { PriceAlert } from '../domain/types'
import { useMarketStore } from '../store/marketStore'

function toView(alert: PriceAlert): AlertView {
  const pair = PAIR_CATALOG.find((candidate) => candidate.symbol === alert.symbol)
  const label = pair ? `${pair.name} (${pair.base}/${pair.quote})` : alert.symbol
  const verb = alert.direction === 'up' ? 'increased' : 'decreased'
  return {
    id: alert.id,
    direction: alert.direction,
    message: `${label} ${verb} by ${Math.abs(alert.changePercent).toFixed(2)}% since you opened the page`,
    prices: `${formatPrice(alert.startPrice)} → ${formatPrice(alert.price)} USDT`,
    time: formatTime(alert.triggeredAt),
  }
}

export function AlertsContainer() {
  const alerts = useMarketStore((state) => state.alerts)
  const dismissAlert = useMarketStore((state) => state.dismissAlert)

  return <AlertList alerts={alerts.map(toView)} onDismiss={dismissAlert} />
}
