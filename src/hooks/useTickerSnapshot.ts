import { useEffect } from 'react'
import type { Pair } from '../domain/types'
import { fetchTickerSnapshot } from '../services/binanceRest'
import { useMarketStore } from '../store/marketStore'

export function useTickerSnapshot(pairs: readonly Pair[]) {
  const applyTickers = useMarketStore((state) => state.applyTickers)
  const setSnapshotStatus = useMarketStore((state) => state.setSnapshotStatus)

  useEffect(() => {
    const controller = new AbortController()
    setSnapshotStatus('loading')

    fetchTickerSnapshot(
      pairs.map((pair) => pair.symbol),
      controller.signal,
    )
      .then((tickers) => {
        if (controller.signal.aborted) return
        applyTickers(tickers)
        setSnapshotStatus('ready')
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setSnapshotStatus('error')
      })

    return () => controller.abort()
  }, [pairs, applyTickers, setSnapshotStatus])
}
