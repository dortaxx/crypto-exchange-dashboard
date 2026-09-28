import { create } from 'zustand'
import { checkAlert } from '../domain/alertCheck'
import type { AlertZone } from '../domain/alerts'
import { nextPairPrice } from '../domain/pairPrice'
import type { ConnectionState, PairPrice, PriceAlert, Ticker } from '../domain/types'

const MAX_ALERTS = 20

type MarketState = {
  prices: Readonly<Record<string, PairPrice>>
  alertZones: Readonly<Record<string, AlertZone>>
  alerts: readonly PriceAlert[]
  connection: ConnectionState
  applyTickers: (tickers: readonly Ticker[]) => void
  retainPairs: (symbols: readonly string[]) => void
  addAlerts: (alerts: readonly PriceAlert[]) => void
  setConnection: (connection: ConnectionState) => void
}

export const useMarketStore = create<MarketState>()((set) => ({
  prices: {},
  alertZones: {},
  alerts: [],
  connection: { status: 'connecting' },
  applyTickers: (tickers) =>
    set((state) => {
      const updated: Record<string, PairPrice> = {}
      for (const ticker of tickers) {
        const next = nextPairPrice(updated[ticker.symbol] ?? state.prices[ticker.symbol], ticker)
        if (next !== null) updated[ticker.symbol] = next
      }
      if (Object.keys(updated).length === 0) return state

      const alertZones = { ...state.alertZones }
      const newAlerts: PriceAlert[] = []
      const now = Date.now()
      for (const [symbol, price] of Object.entries(updated)) {
        const result = checkAlert(symbol, alertZones[symbol] ?? 'calm', price, now)
        alertZones[symbol] = result.zone
        if (result.alert) newAlerts.push(result.alert)
      }

      return {
        prices: { ...state.prices, ...updated },
        alertZones,
        alerts:
          newAlerts.length === 0
            ? state.alerts
            : [...newAlerts, ...state.alerts].slice(0, MAX_ALERTS),
      }
    }),
  retainPairs: (symbols) =>
    set((state) => {
      const keep = new Set(symbols)
      if (Object.keys(state.prices).every((symbol) => keep.has(symbol))) return state
      const kept = <T>(record: Readonly<Record<string, T>>) =>
        Object.fromEntries(Object.entries(record).filter(([symbol]) => keep.has(symbol)))
      return { prices: kept(state.prices), alertZones: kept(state.alertZones) }
    }),
  addAlerts: (alerts) =>
    set((state) =>
      alerts.length === 0 ? state : { alerts: [...alerts, ...state.alerts].slice(0, MAX_ALERTS) },
    ),
  setConnection: (connection) => set({ connection }),
}))
