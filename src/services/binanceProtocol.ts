import { parsePrice } from '../domain/price'
import type { Ticker } from '../domain/types'
import { isRecord } from './guards'

export const BINANCE_STREAM_URL = 'wss://data-stream.binance.vision/ws'

export type SocketMessage =
  | { kind: 'ticker'; ticker: Ticker }
  | { kind: 'ack'; id: number }
  | { kind: 'error'; id: number | null; message: string }
  | { kind: 'ignored' }

type RequestMethod = 'SUBSCRIBE' | 'UNSUBSCRIBE'

const IGNORED: SocketMessage = { kind: 'ignored' }

// Binance acknowledges upper-case stream names but never sends data for them.
export function toStreamName(symbol: string): string {
  return `${symbol.toLowerCase()}@miniTicker`
}

export function buildRequest(
  method: RequestMethod,
  symbols: readonly string[],
  id: number,
): string {
  return JSON.stringify({ method, params: symbols.map(toStreamName), id })
}

export function parseSocketMessage(data: unknown): SocketMessage {
  if (typeof data !== 'string') return IGNORED

  let value: unknown
  try {
    value = JSON.parse(data)
  } catch {
    return IGNORED
  }
  if (!isRecord(value)) return IGNORED

  if (value.e === '24hrMiniTicker') return parseMiniTicker(value)

  const id = typeof value.id === 'number' ? value.id : null
  if (isRecord(value.error)) {
    const message = typeof value.error.msg === 'string' ? value.error.msg : 'Unknown Binance error'
    return { kind: 'error', id, message }
  }
  if ('result' in value && id !== null) return { kind: 'ack', id }

  return IGNORED
}

function parseMiniTicker(value: Record<string, unknown>): SocketMessage {
  if (typeof value.s !== 'string' || typeof value.c !== 'string' || typeof value.E !== 'number') {
    return IGNORED
  }
  const price = parsePrice(value.c)
  if (price === null) return IGNORED
  return { kind: 'ticker', ticker: { symbol: value.s, price, updatedAt: value.E } }
}
