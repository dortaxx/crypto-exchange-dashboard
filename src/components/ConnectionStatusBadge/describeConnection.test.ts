import { describe, expect, it } from 'vitest'
import { describeConnection } from './describeConnection'

describe('describeConnection', () => {
  it('connecting', () => {
    expect(describeConnection({ status: 'connecting' })).toEqual({
      label: 'Connecting…',
      tone: 'waiting',
    })
  })

  it('connected', () => {
    expect(describeConnection({ status: 'connected' })).toEqual({
      label: 'Connected',
      tone: 'live',
    })
  })

  it('reconnecting shows which try it is on', () => {
    expect(describeConnection({ status: 'reconnecting', attempt: 2, retryInMs: 3400 })).toEqual({
      label: 'Reconnecting (try 2)…',
      tone: 'waiting',
    })
  })

  it('disconnected because the browser is offline', () => {
    expect(describeConnection({ status: 'disconnected', reason: 'offline' })).toEqual({
      label: 'Disconnected (offline)',
      tone: 'off',
    })
  })

  it('disconnected on purpose', () => {
    expect(describeConnection({ status: 'disconnected', reason: 'stopped' })).toEqual({
      label: 'Disconnected',
      tone: 'off',
    })
  })

  it('error', () => {
    expect(
      describeConnection({ status: 'error', message: "Couldn't reach Binance after 10 attempts." }),
    ).toEqual({ label: 'Connection lost', tone: 'problem' })
  })
})
