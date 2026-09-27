export type AmountInput =
  { ok: true; value: number } | { ok: false; reason: 'empty' | 'negative' | 'invalid' }

const DECIMAL_NUMBER = /^(\d+[.,]?\d*|[.,]\d+)$/
const MAX_LENGTH = 18

export function parseAmount(input: string): AmountInput {
  const text = input.trim()
  if (text === '') return { ok: false, reason: 'empty' }
  if (text.startsWith('-')) return { ok: false, reason: 'negative' }
  if (text.length > MAX_LENGTH || !DECIMAL_NUMBER.test(text))
    return { ok: false, reason: 'invalid' }
  return { ok: true, value: Number(text.replace(',', '.')) }
}
