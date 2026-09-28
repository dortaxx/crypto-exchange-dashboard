import { describe, expect, it } from 'vitest'
import { formatPercent, formatPrice } from './format'

describe('formatPercent', () => {
  it('shows the same rounded number the alert rule checks', () => {
    expect(formatPercent(-1.9949999999999999)).toBe('-2.00%')
    expect(formatPercent(1.9949999999999999)).toBe('+2.00%')
    expect(formatPercent(0.004)).toBe('0.00%')
    expect(formatPercent(-0.004)).toBe('0.00%')
  })
})

describe('formatPrice', () => {
  it('uses more decimals for cheaper coins', () => {
    expect(formatPrice(84_720.5)).toBe('84,720.50')
    expect(formatPrice(1.53051)).toBe('1.5305')
    expect(formatPrice(0.0975401)).toBe('0.097540')
  })
})
