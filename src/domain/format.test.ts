import { describe, expect, it } from 'vitest'
import { formatAxisPrice, formatPercent, formatPrice } from './format'

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

describe('formatAxisPrice', () => {
  it('shows enough decimals to tell neighbouring ticks apart', () => {
    expect(formatAxisPrice(13.945, 0.005)).toBe('13.945')
    expect(formatAxisPrice(13.95, 0.005)).toBe('13.950')
  })

  it('keeps the usual decimals when the step is coarse', () => {
    expect(formatAxisPrice(84_760, 10)).toBe('84,760.00')
    expect(formatAxisPrice(1.53, 0.01)).toBe('1.5300')
  })
})
