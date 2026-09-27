import { useCallback, useEffect, useRef } from 'react'
import { reachedTargets } from '../domain/targets'
import type { Pair, Ticker } from '../domain/types'
import { BinanceSocket } from '../services/binanceSocket'
import { useMarketStore } from '../store/marketStore'
import { usePreferencesStore } from '../store/preferencesStore'

const FLUSH_INTERVAL_MS = 250

export function useMarketFeed(pairs: readonly Pair[]): { retry: () => void } {
  const socketRef = useRef<BinanceSocket | null>(null)
  const trackedRef = useRef<ReadonlySet<string>>(new Set())

  useEffect(() => {
    const { applyTickers, addAlerts, setConnection } = useMarketStore.getState()
    const socket = new BinanceSocket()
    socketRef.current = socket
    const pending = new Map<string, Ticker>()

    const stopListeningToState = socket.onStateChange(setConnection)
    const stopListeningToTickers = socket.onTicker((ticker) => {
      pending.set(ticker.symbol, ticker)
    })
    const flushTimer = setInterval(() => {
      if (pending.size === 0) return
      const tickers = [...pending.values()].filter((ticker) =>
        trackedRef.current.has(ticker.symbol),
      )
      pending.clear()
      const { hidden, targets, removeTargets } = usePreferencesStore.getState()
      applyTickers(tickers, new Set(hidden))

      const reached = reachedTargets(targets, tickers, Date.now())
      if (reached.length === 0) return
      removeTargets(reached.map((alert) => alert.id))
      addAlerts(reached)
    }, FLUSH_INTERVAL_MS)

    socket.connect()

    return () => {
      clearInterval(flushTimer)
      stopListeningToTickers()
      stopListeningToState()
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  useEffect(() => {
    const symbols = pairs.map((pair) => pair.symbol)
    trackedRef.current = new Set(symbols)
    socketRef.current?.setSymbols(symbols)
    useMarketStore.getState().retainPairs(symbols)
  }, [pairs])

  const retry = useCallback(() => {
    socketRef.current?.connect()
  }, [])

  return { retry }
}
