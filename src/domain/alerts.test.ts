import { describe, expect, it } from 'vitest'
import { nextAlertZone, shouldAlert } from './alerts'

describe('nextAlertZone', () => {
  it('stays calm for small moves', () => {
    expect(nextAlertZone('calm', 1)).toBe('calm')
    expect(nextAlertZone('calm', -1)).toBe('calm')
  })

  it('goes up at +2% or more', () => {
    expect(nextAlertZone('calm', 2)).toBe('up')
    expect(nextAlertZone('calm', 3.5)).toBe('up')
  })

  it('goes down at -2% or less', () => {
    expect(nextAlertZone('calm', -2)).toBe('down')
    expect(nextAlertZone('calm', -4)).toBe('down')
  })

  it('stays in its zone while inside the buffer between 1.5% and 2%', () => {
    expect(nextAlertZone('up', 1.8)).toBe('up')
    expect(nextAlertZone('down', -1.7)).toBe('down')
    expect(nextAlertZone('calm', 1.8)).toBe('calm')
  })

  it('calms down once the move is back under 1.5%', () => {
    expect(nextAlertZone('up', 1.4)).toBe('calm')
    expect(nextAlertZone('down', -1.2)).toBe('calm')
  })

  it('flips straight from up to down on a big reversal', () => {
    expect(nextAlertZone('up', -2.5)).toBe('down')
  })
})

describe('shouldAlert', () => {
  it('alerts when a coin enters the up or down zone', () => {
    expect(shouldAlert('calm', 'up')).toBe(true)
    expect(shouldAlert('calm', 'down')).toBe(true)
    expect(shouldAlert('up', 'down')).toBe(true)
  })

  it('does not alert again while the coin stays in the same zone', () => {
    expect(shouldAlert('up', 'up')).toBe(false)
  })

  it('does not alert when a coin calms down', () => {
    expect(shouldAlert('up', 'calm')).toBe(false)
  })
})
