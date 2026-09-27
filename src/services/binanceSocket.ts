import type { ConnectionState, Ticker } from '../domain/types'
import { backoffDelay } from './backoff'
import { BINANCE_STREAM_URL, buildRequest, parseSocketMessage } from './binanceProtocol'

type StateListener = (state: ConnectionState) => void
type TickerListener = (ticker: Ticker) => void

export type NetworkStatus = {
  isOnline: () => boolean
  onChange: (listener: (online: boolean) => void) => () => void
}

const browserNetwork: NetworkStatus = {
  isOnline: () => navigator.onLine,
  onChange: (listener) => {
    const handleOnline = () => {
      listener(true)
    }
    const handleOffline = () => {
      listener(false)
    }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  },
}

type BinanceSocketOptions = {
  url?: string
  maxAttempts?: number
  staleAfterMs?: number
  random?: () => number
  createSocket?: (url: string) => WebSocket
  network?: NetworkStatus
}

export class BinanceSocket {
  private readonly url: string
  private readonly maxAttempts: number
  private readonly staleAfterMs: number
  private readonly random: () => number
  private readonly createSocket: (url: string) => WebSocket
  private readonly network: NetworkStatus
  private socket: WebSocket | null = null
  private retryTimer: ReturnType<typeof setTimeout> | null = null
  private watchdogTimer: ReturnType<typeof setTimeout> | null = null
  private stopWatchingNetwork: (() => void) | null = null
  private attempt = 0
  private requestId = 0
  private symbols = new Set<string>()
  private state: ConnectionState = { status: 'disconnected', reason: 'stopped' }
  private readonly stateListeners = new Set<StateListener>()
  private readonly tickerListeners = new Set<TickerListener>()

  constructor(options: BinanceSocketOptions = {}) {
    this.url = options.url ?? BINANCE_STREAM_URL
    this.maxAttempts = options.maxAttempts ?? 10
    this.staleAfterMs = options.staleAfterMs ?? 10_000
    this.random = options.random ?? Math.random
    this.createSocket = options.createSocket ?? ((url) => new WebSocket(url))
    this.network = options.network ?? browserNetwork
  }

  getState(): ConnectionState {
    return this.state
  }

  onStateChange(listener: StateListener): () => void {
    this.stateListeners.add(listener)
    return () => {
      this.stateListeners.delete(listener)
    }
  }

  onTicker(listener: TickerListener): () => void {
    this.tickerListeners.add(listener)
    return () => {
      this.tickerListeners.delete(listener)
    }
  }

  setSymbols(symbols: readonly string[]): void {
    const next = new Set(symbols)
    const added = [...next].filter((symbol) => !this.symbols.has(symbol))
    const removed = [...this.symbols].filter((symbol) => !next.has(symbol))
    this.symbols = next

    if (this.socket?.readyState !== WebSocket.OPEN) return
    if (removed.length > 0) this.send('UNSUBSCRIBE', removed)
    if (added.length > 0) this.send('SUBSCRIBE', added)
    this.resetWatchdog()
  }

  connect(): void {
    if (this.socket !== null || this.retryTimer !== null) return
    this.stopWatchingNetwork ??= this.network.onChange(this.handleNetworkChange)
    this.attempt = 0

    if (!this.network.isOnline()) {
      this.setState({ status: 'disconnected', reason: 'offline' })
      return
    }
    this.open()
  }

  disconnect(): void {
    this.stopWatchingNetwork?.()
    this.stopWatchingNetwork = null
    this.cancelRetry()
    this.releaseSocket(1000, 'Closed by the app')
    this.setState({ status: 'disconnected', reason: 'stopped' })
  }

  private open(): void {
    const socket = this.createSocket(this.url)
    this.socket = socket
    this.setState({ status: 'connecting' })

    socket.onopen = () => {
      if (socket !== this.socket) return
      this.setState({ status: 'connected' })
      if (this.symbols.size > 0) this.send('SUBSCRIBE', [...this.symbols])
      this.resetWatchdog()
    }

    socket.onmessage = (event: MessageEvent) => {
      if (socket !== this.socket) return
      this.handleMessage(event.data)
    }

    socket.onclose = () => {
      if (socket !== this.socket) return
      this.socket = null
      this.clearWatchdog()
      this.scheduleReconnect()
    }
  }

  private handleMessage(data: unknown): void {
    const message = parseSocketMessage(data)
    switch (message.kind) {
      case 'ticker':
        this.attempt = 0
        this.resetWatchdog()
        if (!this.symbols.has(message.ticker.symbol)) return
        for (const listener of this.tickerListeners) listener(message.ticker)
        return
      case 'error':
        console.warn(`Binance rejected request ${message.id ?? '?'}: ${message.message}`)
        return
      case 'ack':
      case 'ignored':
        return
    }
  }

  private send(method: 'SUBSCRIBE' | 'UNSUBSCRIBE', symbols: readonly string[]): void {
    this.requestId += 1
    this.socket?.send(buildRequest(method, symbols, this.requestId))
  }

  private resetWatchdog(): void {
    this.clearWatchdog()
    if (this.symbols.size === 0) return
    this.watchdogTimer = setTimeout(() => {
      this.watchdogTimer = null
      this.releaseSocket(4000, 'No data received')
      this.scheduleReconnect()
    }, this.staleAfterMs)
  }

  private clearWatchdog(): void {
    if (this.watchdogTimer === null) return
    clearTimeout(this.watchdogTimer)
    this.watchdogTimer = null
  }

  private releaseSocket(code: number, reason: string): void {
    this.clearWatchdog()
    const socket = this.socket
    this.socket = null
    socket?.close(code, reason)
  }

  private readonly handleNetworkChange = (online: boolean): void => {
    if (!online) {
      this.cancelRetry()
      this.releaseSocket(1000, 'Browser went offline')
      this.setState({ status: 'disconnected', reason: 'offline' })
      return
    }
    if (this.state.status === 'disconnected' && this.state.reason === 'offline') {
      this.attempt = 0
      this.open()
    }
  }

  private scheduleReconnect(): void {
    this.attempt += 1
    if (this.attempt > this.maxAttempts) {
      this.setState({
        status: 'error',
        message: `Couldn't reach Binance after ${this.maxAttempts} attempts.`,
      })
      return
    }

    const retryInMs = backoffDelay(this.attempt, this.random)
    this.setState({ status: 'reconnecting', attempt: this.attempt, retryInMs })
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null
      this.open()
    }, retryInMs)
  }

  private cancelRetry(): void {
    if (this.retryTimer === null) return
    clearTimeout(this.retryTimer)
    this.retryTimer = null
  }

  private setState(next: ConnectionState): void {
    this.state = next
    for (const listener of this.stateListeners) listener(next)
  }
}
