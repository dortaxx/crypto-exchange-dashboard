import { describe, expect, it } from 'vitest'
import { parseAmount } from './amount'

describe('parseAmount', () => {
  it.each([
    ['0.5', 0.5],
    ['0,5', 0.5],
    ['12', 12],
    ['12.', 12],
    ['.5', 0.5],
    [' 2 ', 2],
    ['0', 0],
  ])('accepts %s', (input, value) => {
    expect(parseAmount(input)).toEqual({ ok: true, value })
  })

  it('treats an empty field as empty, not as an error', () => {
    expect(parseAmount('   ')).toEqual({ ok: false, reason: 'empty' })
  })

  it('rejects negative amounts', () => {
    expect(parseAmount('-1')).toEqual({ ok: false, reason: 'negative' })
  })

  it.each(['1e3', '1E3', 'abc', '1.2.3', '.', '+5', 'Infinity', 'NaN', '1 000', '9'.repeat(19)])(
    'rejects %s',
    (input) => {
      expect(parseAmount(input)).toEqual({ ok: false, reason: 'invalid' })
    },
  )
})
