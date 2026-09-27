import { create } from 'zustand'
import { nextPairPrice } from '../domain/pairPrice'
import type { ConnectionState, LoadStatus, PairPrice, Ticker } from '../domain/types'

type MarketState = {
  prices: Readonly<Record<string, PairPrice>>
  snapshotStatus: LoadStatus
  connection: ConnectionState
  applyTickers: (tickers: readonly Ticker[]) => void
  setSnapshotStatus: (status: LoadStatus) => void
  setConnection: (connection: ConnectionState) => void
}

export const useMarketStore = create<MarketState>()((set) => ({
  prices: {},
  snapshotStatus: 'loading',
  connection: { status: 'connecting' },
  applyTickers: (tickers) =>
    set((state) => {
      const updated: Record<string, PairPrice> = {}
      for (const ticker of tickers) {
        const next = nextPairPrice(updated[ticker.symbol] ?? state.prices[ticker.symbol], ticker)
        if (next !== null) updated[ticker.symbol] = next
      }
      if (Object.keys(updated).length === 0) return state
      return { prices: { ...state.prices, ...updated } }
    }),
  setSnapshotStatus: (snapshotStatus) => set({ snapshotStatus }),
  setConnection: (connection) => set({ connection }),
}))
