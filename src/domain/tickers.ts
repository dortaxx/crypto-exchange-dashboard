import type { Ticker } from './types'

export function shouldReplaceTicker(current: Ticker | undefined, incoming: Ticker): boolean {
  return current === undefined || incoming.updatedAt >= current.updatedAt
}
