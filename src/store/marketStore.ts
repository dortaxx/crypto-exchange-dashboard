import { create } from 'zustand'
import { shouldReplaceTicker } from '../domain/tickers'
import type { LoadStatus, Ticker } from '../domain/types'

type MarketState = {
  tickers: Readonly<Record<string, Ticker>>
  snapshotStatus: LoadStatus
  applyTickers: (incoming: readonly Ticker[]) => void
  setSnapshotStatus: (status: LoadStatus) => void
}

export const useMarketStore = create<MarketState>()((set) => ({
  tickers: {},
  snapshotStatus: 'loading',
  applyTickers: (incoming) =>
    set((state) => {
      const tickers = { ...state.tickers }
      for (const ticker of incoming) {
        if (shouldReplaceTicker(tickers[ticker.symbol], ticker)) {
          tickers[ticker.symbol] = ticker
        }
      }
      return { tickers }
    }),
  setSnapshotStatus: (snapshotStatus) => set({ snapshotStatus }),
}))
