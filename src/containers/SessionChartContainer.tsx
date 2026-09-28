import { useState } from 'react'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { SessionChart } from '../components/SessionChart/SessionChart'
import type { Pair } from '../domain/types'
import { useMarketStore } from '../store/marketStore'
import { usePreferencesStore } from '../store/preferencesStore'

type SessionChartContainerProps = {
  pairs: readonly Pair[]
}

export function SessionChartContainer({ pairs }: SessionChartContainerProps) {
  const hidden = usePreferencesStore((state) => state.hidden)
  const [chosen, setChosen] = useState<string | null>(null)
  const shown = pairs.filter((pair) => !hidden.includes(pair.symbol))
  const pair = shown.find((candidate) => candidate.symbol === chosen) ?? shown[0]
  const price = useMarketStore((state) => (pair ? state.prices[pair.symbol] : undefined))
  const unavailable = useMarketStore((state) => state.connection.status === 'error')

  if (pair === undefined) {
    return (
      <EmptyState
        title="Nothing to chart"
        message="Every pair is hidden. Restore one in Markets to chart it here."
      />
    )
  }

  return (
    <SessionChart
      pairs={shown}
      pair={pair}
      price={price}
      unavailable={unavailable}
      onSelect={setChosen}
    />
  )
}
