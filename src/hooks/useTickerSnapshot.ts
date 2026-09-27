import { useEffect } from 'react'
import type { Pair } from '../domain/types'
import { fetchTickerSnapshot } from '../services/binanceRest'
import { useMarketStore } from '../store/marketStore'

export function useTickerSnapshot(pairs: readonly Pair[]) {
  useEffect(() => {
    const { prices, applyTickers, setSnapshotStatus } = useMarketStore.getState()
    const missing = pairs.map((pair) => pair.symbol).filter((symbol) => !(symbol in prices))
    if (missing.length === 0) return

    const controller = new AbortController()
    const firstLoad = Object.keys(prices).length === 0
    if (firstLoad) setSnapshotStatus('loading')

    fetchTickerSnapshot(missing, controller.signal)
      .then((tickers) => {
        if (controller.signal.aborted) return
        applyTickers(tickers)
      })
      .catch(() => {
        if (controller.signal.aborted) return
        if (Object.keys(useMarketStore.getState().prices).length === 0) setSnapshotStatus('error')
      })

    return () => {
      controller.abort()
    }
  }, [pairs])
}
