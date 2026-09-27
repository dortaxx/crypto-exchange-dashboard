import type { Pair } from './types'

function normalize(text: string): string {
  return text.toLowerCase().replace(/[\s/_-]+/g, '')
}

export function matchesSearch(pair: Pair, query: string): boolean {
  const needle = normalize(query)
  if (needle === '') return true
  return [pair.name, pair.base, pair.symbol].some((field) => normalize(field).includes(needle))
}
