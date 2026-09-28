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

export type Direction = 'up' | 'down' | 'flat'

export type MoveAlert = {
  kind: 'move'
  id: string
  symbol: string
  direction: 'up' | 'down'
  startPrice: number
  price: number
  changePercent: number
  triggeredAt: number
}

export type TargetAlert = {
  kind: 'target'
  id: string
  symbol: string
  direction: 'up' | 'down'
  targetPrice: number
  price: number
  triggeredAt: number
}

export type PriceAlert = MoveAlert | TargetAlert

export type PriceTarget = {
  id: string
  symbol: string
  price: number
  direction: 'up' | 'down'
  createdAt: number
}

export type PricePoint = {
  time: number
  price: number
}

export type PairPrice = {
  price: number
  startPrice: number
  changePercent: number
  direction: Direction
  updatedAt: number
  history: readonly PricePoint[]
}

export type ConnectionState =
  | { status: 'connecting' }
  | { status: 'connected' }
  | { status: 'reconnecting'; attempt: number; retryInMs: number }
  | { status: 'disconnected'; reason: 'stopped' | 'offline' }
  | { status: 'error'; message: string }

export const VIEW_MODES = ['all', 'favorites'] as const
export const THEME_CHOICES = ['system', 'light', 'dark'] as const
export const SORT_KEYS = ['name', 'price', 'change'] as const
export const SORT_DIRECTIONS = ['asc', 'desc'] as const

export type ViewMode = (typeof VIEW_MODES)[number]
export type ThemeChoice = (typeof THEME_CHOICES)[number]
export type SortKey = (typeof SORT_KEYS)[number]
export type SortDirection = (typeof SORT_DIRECTIONS)[number]
