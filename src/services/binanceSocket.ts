import type { ConnectionState } from '../domain/types'
import { backoffDelay } from './backoff'
import { BINANCE_STREAM_URL } from './binanceProtocol'

type StateListener = (state: ConnectionState) => void

type BinanceSocketOptions = {
  url?: string
  maxAttempts?: number
  random?: () => number
}

export class BinanceSocket {
  private readonly url: string
  private readonly maxAttempts: number
  private readonly random: () => number
  private socket: WebSocket | null = null
  private retryTimer: ReturnType<typeof setTimeout> | null = null
  private attempt = 0
  private state: ConnectionState = { status: 'disconnected' }
  private readonly stateListeners = new Set<StateListener>()

  constructor(options: BinanceSocketOptions = {}) {
    this.url = options.url ?? BINANCE_STREAM_URL
    this.maxAttempts = options.maxAttempts ?? 10
    this.random = options.random ?? Math.random
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

  connect(): void {
    if (this.socket !== null || this.retryTimer !== null) return
    this.attempt = 0
    this.open()
  }

  disconnect(): void {
    this.cancelRetry()
    const socket = this.socket
    this.socket = null
    socket?.close(1000, 'Closed by the app')
    this.setState({ status: 'disconnected' })
  }

  private open(): void {
    const socket = new WebSocket(this.url)
    this.socket = socket
    this.setState({ status: 'connecting' })

    socket.onopen = () => {
      if (socket !== this.socket) return
      this.attempt = 0
      this.setState({ status: 'connected' })
    }

    socket.onclose = () => {
      if (socket !== this.socket) return
      this.socket = null
      this.scheduleReconnect()
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
