import type { ConnectionState } from '../domain/types'
import { BINANCE_STREAM_URL } from './binanceProtocol'

type StateListener = (state: ConnectionState) => void

export class BinanceSocket {
  private readonly url: string
  private socket: WebSocket | null = null
  private state: ConnectionState = { status: 'disconnected' }
  private readonly stateListeners = new Set<StateListener>()

  constructor(url: string = BINANCE_STREAM_URL) {
    this.url = url
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
    if (this.socket !== null) return

    const socket = new WebSocket(this.url)
    this.socket = socket
    this.setState({ status: 'connecting' })

    socket.onopen = () => {
      if (socket !== this.socket) return
      this.setState({ status: 'connected' })
    }

    socket.onclose = () => {
      if (socket !== this.socket) return
      this.socket = null
      this.setState({ status: 'disconnected' })
    }
  }

  disconnect(): void {
    const socket = this.socket
    if (socket === null) return

    this.socket = null
    socket.close(1000, 'Closed by the app')
    this.setState({ status: 'disconnected' })
  }

  private setState(next: ConnectionState): void {
    this.state = next
    for (const listener of this.stateListeners) listener(next)
  }
}
