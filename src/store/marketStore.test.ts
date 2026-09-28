import { beforeEach, describe, expect, it } from 'vitest'
import type { Ticker } from '../domain/types'
import { useMarketStore } from './marketStore'

const initialState = useMarketStore.getState()
const ticker = (symbol: string, price: number, updatedAt = 1): Ticker => ({
  symbol,
  price,
  updatedAt,
})

beforeEach(() => {
  useMarketStore.setState(initialState, true)
})

describe('marketStore', () => {
  it('stores the first price of each pair', () => {
    useMarketStore.getState().applyTickers([ticker('BTCUSDT', 100), ticker('ETHUSDT', 10)])

    const { prices } = useMarketStore.getState()
    expect(prices.BTCUSDT).toMatchObject({ price: 100, startPrice: 100 })
    expect(prices.ETHUSDT).toMatchObject({ price: 10, startPrice: 10 })
  })

  it('raises one alert when a pair moves 2% from its first price', () => {
    const { applyTickers } = useMarketStore.getState()
    applyTickers([ticker('BTCUSDT', 100, 1)])
    applyTickers([ticker('BTCUSDT', 102.5, 2)])
    applyTickers([ticker('BTCUSDT', 103, 3)])

    expect(useMarketStore.getState().alerts).toEqual([
      expect.objectContaining({ symbol: 'BTCUSDT', direction: 'up', changePercent: 2.5 }),
    ])
  })

  it('forgets prices of pairs that are no longer tracked', () => {
    const { applyTickers, retainPairs } = useMarketStore.getState()
    applyTickers([ticker('BTCUSDT', 100), ticker('ETHUSDT', 10)])

    retainPairs(['BTCUSDT'])

    expect(Object.keys(useMarketStore.getState().prices)).toEqual(['BTCUSDT'])
    expect(Object.keys(useMarketStore.getState().alertZones)).toEqual(['BTCUSDT'])
  })

  it('puts new alerts first and keeps the list bounded', () => {
    const alert = (id: string) =>
      ({
        kind: 'target',
        id,
        symbol: 'BTCUSDT',
        direction: 'up',
        targetPrice: 1,
        price: 1,
        triggeredAt: 0,
      }) as const
    const { addAlerts } = useMarketStore.getState()
    addAlerts([alert('old')])
    addAlerts(Array.from({ length: 25 }, (_, i) => alert(`new-${i}`)))

    const { alerts } = useMarketStore.getState()
    expect(alerts).toHaveLength(20)
    expect(alerts[0]?.id).toBe('new-0')
  })

  it('keeps the same state object when there is nothing to forget', () => {
    useMarketStore.getState().applyTickers([ticker('BTCUSDT', 100)])
    const before = useMarketStore.getState()

    useMarketStore.getState().retainPairs(['BTCUSDT', 'ETHUSDT'])

    expect(useMarketStore.getState()).toBe(before)
  })
})
