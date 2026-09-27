import { useEffect, useRef } from 'react'
import type { Pair, Ticker } from '../domain/types'
import { BinanceSocket } from '../services/binanceSocket'
import { useMarketStore } from '../store/marketStore'

const FLUSH_INTERVAL_MS = 250

export function useMarketFeed(pairs: readonly Pair[]): void {
  const socketRef = useRef<BinanceSocket | null>(null)

  useEffect(() => {
    const { applyTickers, setConnection } = useMarketStore.getState()
    const socket = new BinanceSocket()
    socketRef.current = socket
    const pending = new Map<string, Ticker>()

    const stopListeningToState = socket.onStateChange(setConnection)
    const stopListeningToTickers = socket.onTicker((ticker) => {
      pending.set(ticker.symbol, ticker)
    })
    const flushTimer = setInterval(() => {
      if (pending.size === 0) return
      applyTickers([...pending.values()])
      pending.clear()
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
    socketRef.current?.setSymbols(pairs.map((pair) => pair.symbol))
  }, [pairs])
}
