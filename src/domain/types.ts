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
