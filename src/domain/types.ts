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

export type Direction = 'up' | 'down' | 'flat'

export type PriceAlert = {
  id: string
  symbol: string
  direction: 'up' | 'down'
  startPrice: number
  price: number
  changePercent: number
  triggeredAt: number
}

export type PairPrice = {
  price: number
  startPrice: number
  changePercent: number
  direction: Direction
  updatedAt: number
}

export type ConnectionState =
  | { status: 'connecting' }
  | { status: 'connected' }
  | { status: 'reconnecting'; attempt: number; retryInMs: number }
  | { status: 'disconnected'; reason: 'stopped' | 'offline' }
  | { status: 'error'; message: string }
