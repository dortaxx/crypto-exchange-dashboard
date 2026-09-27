import { StatStrip } from '../components/StatStrip/StatStrip'
import { formatPercent } from '../domain/format'
import { topMovers, type Mover } from '../domain/stats'
import type { Pair } from '../domain/types'
import { useMarketStore } from '../store/marketStore'

type StatsContainerProps = {
  pairs: readonly Pair[]
}

export function StatsContainer({ pairs }: StatsContainerProps) {
  const prices = useMarketStore((state) => state.prices)
  const alertCount = useMarketStore((state) => state.alerts.length)
  const failed = useMarketStore((state) => state.snapshotStatus === 'error')
  const hasPrices = Object.keys(prices).length > 0
  const { gainer, loser } = topMovers(
    prices,
    pairs.map((pair) => pair.symbol),
  )

  const describeMover = (mover: Mover | null) => {
    if (!hasPrices) return failed ? '—' : undefined
    if (mover === null) return '—'
    const base = pairs.find((pair) => pair.symbol === mover.symbol)?.base ?? mover.symbol
    return `${base} ${formatPercent(mover.changePercent)}`
  }

  return (
    <StatStrip
      stats={[
        { label: 'Pairs tracked', value: String(pairs.length) },
        { label: 'Top gainer since open', value: describeMover(gainer) },
        { label: 'Top loser since open', value: describeMover(loser) },
        { label: 'Alerts', value: String(alertCount) },
      ]}
    />
  )
}
