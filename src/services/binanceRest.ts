import type { Ticker } from '../domain/types'

const REST_BASE_URL = 'https://data-api.binance.vision/api/v3'

type RawMiniTicker = {
  symbol: string
  lastPrice: string
  closeTime: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isRawMiniTicker(value: unknown): value is RawMiniTicker {
  return (
    isRecord(value) &&
    typeof value.symbol === 'string' &&
    typeof value.lastPrice === 'string' &&
    typeof value.closeTime === 'number'
  )
}

function toTicker(raw: RawMiniTicker): Ticker | null {
  const price = Number(raw.lastPrice)
  if (!Number.isFinite(price) || price <= 0) return null
  return { symbol: raw.symbol, price, updatedAt: raw.closeTime }
}

export async function fetchTickerSnapshot(
  symbols: readonly string[],
  signal?: AbortSignal,
): Promise<Ticker[]> {
  const url = new URL(`${REST_BASE_URL}/ticker/24hr`)
  url.searchParams.set('symbols', JSON.stringify(symbols))
  url.searchParams.set('type', 'MINI')

  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error(`Binance snapshot request failed with HTTP ${response.status}`)
  }

  const body: unknown = await response.json()
  if (!Array.isArray(body)) {
    throw new Error('Binance snapshot response was not a list')
  }
  const items: unknown[] = body

  return items
    .filter(isRawMiniTicker)
    .map(toTicker)
    .filter((ticker): ticker is Ticker => ticker !== null)
}
