const BASE_DELAY_MS = 1_000
const MAX_DELAY_MS = 30_000

export function backoffDelay(attempt: number, random: () => number = Math.random): number {
  const ceiling = Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** (attempt - 1))
  return Math.round(random() * ceiling)
}
