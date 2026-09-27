import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Ticker } from '../domain/types'
import { BinanceSocket, type NetworkStatus } from './binanceSocket'

class FakeSocket {
  static instances: FakeSocket[] = []
  readonly url: string
  readyState = 0
  sent: string[] = []
  closedWith: { code: number | undefined; reason: string | undefined } | null = null
  onopen: (() => void) | null = null
  onmessage: ((event: { data: unknown }) => void) | null = null
  onclose: (() => void) | null = null

  constructor(url: string) {
    this.url = url
    FakeSocket.instances.push(this)
  }

  send(data: string) {
    this.sent.push(data)
  }

  close(code?: number, reason?: string) {
    this.closedWith = { code, reason }
    this.readyState = 3
    setTimeout(() => this.onclose?.(), 0)
  }

  simulateOpen() {
    this.readyState = 1
    this.onopen?.()
  }

  simulateMessage(text: string) {
    this.onmessage?.({ data: text })
  }

  simulateDrop() {
    this.readyState = 3
    this.onclose?.()
  }

  requests(): { method: string; params: string[] }[] {
    return this.sent.map((text) => JSON.parse(text) as { method: string; params: string[] })
  }
}

function fakeNetwork(initiallyOnline = true) {
  let online = initiallyOnline
  const listeners = new Set<(online: boolean) => void>()
  const network: NetworkStatus = {
    isOnline: () => online,
    onChange: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
  return {
    network,
    goOffline: () => {
      online = false
      for (const listener of listeners) listener(false)
    },
    goOnline: () => {
      online = true
      for (const listener of listeners) listener(true)
    },
    listenerCount: () => listeners.size,
  }
}

function setup(options: { maxAttempts?: number; online?: boolean } = {}) {
  const net = fakeNetwork(options.online ?? true)
  const phone = new BinanceSocket({
    createSocket: (url) => new FakeSocket(url) as unknown as WebSocket,
    network: net.network,
    random: () => 1,
    staleAfterMs: 10_000,
    maxAttempts: options.maxAttempts ?? 10,
  })
  const tickers: Ticker[] = []
  phone.onTicker((ticker) => tickers.push(ticker))
  const latestSocket = () => {
    const socket = FakeSocket.instances.at(-1)
    if (socket === undefined) throw new Error('No socket was created')
    return socket
  }
  return { phone, net, tickers, latestSocket }
}

const priceMessage = (symbol: string, price: string) =>
  JSON.stringify({ e: '24hrMiniTicker', E: 1790435739015, s: symbol, c: price })

beforeEach(() => {
  FakeSocket.instances = []
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('connecting and subscribing', () => {
  it('subscribes to every wanted pair as soon as the connection opens', () => {
    const { phone, latestSocket } = setup()
    phone.setSymbols(['BTCUSDT', 'ETHUSDT'])
    phone.connect()
    expect(phone.getState()).toEqual({ status: 'connecting' })

    latestSocket().simulateOpen()

    expect(phone.getState()).toEqual({ status: 'connected' })
    expect(latestSocket().requests()).toEqual([
      expect.objectContaining({
        method: 'SUBSCRIBE',
        params: ['btcusdt@miniTicker', 'ethusdt@miniTicker'],
      }),
    ])
  })

  it('passes price updates to ticker listeners', () => {
    const { phone, tickers, latestSocket } = setup()
    phone.setSymbols(['BTCUSDT'])
    phone.connect()
    latestSocket().simulateOpen()

    latestSocket().simulateMessage(priceMessage('BTCUSDT', '84028.01'))

    expect(tickers).toEqual([{ symbol: 'BTCUSDT', price: 84028.01, updatedAt: 1790435739015 }])
  })

  it('sends only the difference when pairs change while connected, without reconnecting', () => {
    const { phone, latestSocket } = setup()
    phone.setSymbols(['BTCUSDT', 'ETHUSDT'])
    phone.connect()
    latestSocket().simulateOpen()

    phone.setSymbols(['BTCUSDT', 'SOLUSDT'])

    expect(FakeSocket.instances).toHaveLength(1)
    expect(latestSocket().requests().slice(1)).toEqual([
      expect.objectContaining({ method: 'UNSUBSCRIBE', params: ['ethusdt@miniTicker'] }),
      expect.objectContaining({ method: 'SUBSCRIBE', params: ['solusdt@miniTicker'] }),
    ])
  })
})

describe('reconnecting', () => {
  it('reconnects after an unexpected drop and subscribes again', () => {
    const { phone, latestSocket } = setup()
    phone.setSymbols(['BTCUSDT'])
    phone.connect()
    latestSocket().simulateOpen()

    latestSocket().simulateDrop()
    expect(phone.getState()).toEqual({ status: 'reconnecting', attempt: 1, retryInMs: 1_000 })

    vi.advanceTimersByTime(1_000)
    expect(FakeSocket.instances).toHaveLength(2)
    latestSocket().simulateOpen()
    expect(latestSocket().requests()).toEqual([
      expect.objectContaining({ method: 'SUBSCRIBE', params: ['btcusdt@miniTicker'] }),
    ])
  })

  it('waits longer after each failed attempt and gives up after the limit', () => {
    const { phone, latestSocket } = setup({ maxAttempts: 3 })
    phone.connect()

    latestSocket().simulateDrop()
    expect(phone.getState()).toMatchObject({ attempt: 1, retryInMs: 1_000 })
    vi.advanceTimersByTime(1_000)
    latestSocket().simulateDrop()
    expect(phone.getState()).toMatchObject({ attempt: 2, retryInMs: 2_000 })
    vi.advanceTimersByTime(2_000)
    latestSocket().simulateDrop()
    expect(phone.getState()).toMatchObject({ attempt: 3, retryInMs: 4_000 })
    vi.advanceTimersByTime(4_000)
    latestSocket().simulateDrop()

    expect(phone.getState()).toEqual({
      status: 'error',
      message: "Couldn't reach Binance after 3 attempts.",
    })
  })

  it('starts counting attempts again once prices flow', () => {
    const { phone, latestSocket } = setup()
    phone.setSymbols(['BTCUSDT'])
    phone.connect()
    latestSocket().simulateDrop()
    vi.advanceTimersByTime(1_000)
    latestSocket().simulateOpen()
    latestSocket().simulateMessage(priceMessage('BTCUSDT', '84028.01'))

    latestSocket().simulateDrop()

    expect(phone.getState()).toMatchObject({ status: 'reconnecting', attempt: 1 })
  })

  it('reconnects on connect() after giving up', () => {
    const { phone, latestSocket } = setup({ maxAttempts: 1 })
    phone.connect()
    latestSocket().simulateDrop()
    vi.advanceTimersByTime(1_000)
    latestSocket().simulateDrop()
    expect(phone.getState().status).toBe('error')

    phone.connect()

    expect(phone.getState()).toEqual({ status: 'connecting' })
  })
})

describe('closing on purpose', () => {
  it('never reconnects after disconnect()', () => {
    const { phone, latestSocket } = setup()
    phone.connect()
    latestSocket().simulateOpen()

    phone.disconnect()
    vi.advanceTimersByTime(60_000)

    expect(FakeSocket.instances).toHaveLength(1)
    expect(latestSocket().closedWith).toEqual({ code: 1000, reason: 'Closed by the app' })
    expect(phone.getState()).toEqual({ status: 'disconnected', reason: 'stopped' })
  })

  it('cancels a pending reconnect when disconnect() is called while waiting', () => {
    const { phone, latestSocket } = setup()
    phone.connect()
    latestSocket().simulateDrop()

    phone.disconnect()
    vi.advanceTimersByTime(60_000)

    expect(FakeSocket.instances).toHaveLength(1)
  })

  it('ignores late events from a socket that was already replaced', () => {
    const { phone } = setup()
    phone.connect()
    const first = FakeSocket.instances[0]
    phone.disconnect()
    phone.connect()

    first?.simulateOpen()
    first?.simulateDrop()
    vi.advanceTimersByTime(60_000)

    expect(FakeSocket.instances).toHaveLength(2)
    expect(phone.getState()).toEqual({ status: 'connecting' })
  })
})

describe('watchdog', () => {
  it('drops a silent connection and reconnects', () => {
    const { phone, latestSocket } = setup()
    phone.setSymbols(['BTCUSDT'])
    phone.connect()
    const silent = latestSocket()
    silent.simulateOpen()

    vi.advanceTimersByTime(10_000)

    expect(silent.closedWith).toEqual({ code: 4000, reason: 'No data received' })
    expect(phone.getState()).toMatchObject({ status: 'reconnecting', attempt: 1 })
  })

  it('stays connected while prices keep arriving', () => {
    const { phone, latestSocket } = setup()
    phone.setSymbols(['BTCUSDT'])
    phone.connect()
    latestSocket().simulateOpen()

    for (let second = 0; second < 30; second += 1) {
      vi.advanceTimersByTime(1_000)
      latestSocket().simulateMessage(priceMessage('BTCUSDT', '84028.01'))
    }

    expect(phone.getState()).toEqual({ status: 'connected' })
    expect(FakeSocket.instances).toHaveLength(1)
  })

  it('does not treat silence as a problem when no pairs are wanted', () => {
    const { phone, latestSocket } = setup()
    phone.connect()
    latestSocket().simulateOpen()

    vi.advanceTimersByTime(60_000)

    expect(phone.getState()).toEqual({ status: 'connected' })
  })
})

describe('offline', () => {
  it('stops and waits while the browser is offline, then reconnects when it comes back', () => {
    const { phone, net, latestSocket } = setup()
    phone.connect()
    latestSocket().simulateOpen()

    net.goOffline()
    expect(phone.getState()).toEqual({ status: 'disconnected', reason: 'offline' })
    vi.advanceTimersByTime(60_000)
    expect(FakeSocket.instances).toHaveLength(1)

    net.goOnline()
    expect(FakeSocket.instances).toHaveLength(2)
    expect(phone.getState()).toEqual({ status: 'connecting' })
  })

  it('waits for the network when connect() is called offline', () => {
    const { phone, net } = setup({ online: false })
    phone.connect()
    expect(FakeSocket.instances).toHaveLength(0)
    expect(phone.getState()).toEqual({ status: 'disconnected', reason: 'offline' })

    net.goOnline()

    expect(FakeSocket.instances).toHaveLength(1)
  })

  it('stops listening to the network after disconnect()', () => {
    const { phone, net } = setup()
    phone.connect()
    expect(net.listenerCount()).toBe(1)

    phone.disconnect()

    expect(net.listenerCount()).toBe(0)
  })
})
