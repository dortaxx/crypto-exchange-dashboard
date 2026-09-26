export type Pair = {
  symbol: string
  base: string
  quote: 'USDT'
  name: string
}

export type Ticker = {
  symbol: string
  price: number
  updatedAt: number
}

export type LoadStatus = 'loading' | 'ready' | 'error'

export type ConnectionState =
  | { status: 'connecting' }
  | { status: 'connected' }
  | { status: 'reconnecting'; attempt: number; retryInMs: number }
  | { status: 'disconnected' }
  | { status: 'error'; message: string }
