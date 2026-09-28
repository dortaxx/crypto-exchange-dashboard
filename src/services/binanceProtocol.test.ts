import { describe, expect, it } from 'vitest'
import { buildRequest, parseSocketMessage, toStreamName } from './binanceProtocol'

const REAL_MINI_TICKER =
  '{"e":"24hrMiniTicker","E":1790435739015,"s":"BTCUSDT","c":"84028.01000000","o":"84004.82000000","h":"84336.96000000","l":"83363.63000000","v":"8974.97894000","q":"753516400.00"}'
const REAL_ACK = '{"result":null,"id":1}'
const REAL_ERROR =
  '{"error":{"code":2,"msg":"Invalid request: unknown variant `NOT_A_METHOD`"},"id":2}'

describe('parseSocketMessage', () => {
  it('turns a real mini ticker into a Ticker', () => {
    expect(parseSocketMessage(REAL_MINI_TICKER)).toEqual({
      kind: 'ticker',
      ticker: { symbol: 'BTCUSDT', price: 84028.01, updatedAt: 1790435739015 },
    })
  })

  it('recognises a subscription acknowledgement', () => {
    expect(parseSocketMessage(REAL_ACK)).toEqual({ kind: 'ack', id: 1 })
  })

  it('reads the nested error format Binance actually sends', () => {
    expect(parseSocketMessage(REAL_ERROR)).toEqual({
      kind: 'error',
      id: 2,
      message: 'Invalid request: unknown variant `NOT_A_METHOD`',
    })
  })

  it.each([
    ['invalid JSON', '{"e":'],
    ['a JSON value that is not an object', '42'],
    ['null', 'null'],
    ['another stream type', '{"e":"aggTrade","E":1,"s":"BTCUSDT","p":"1"}'],
    ['a ticker without a price', '{"e":"24hrMiniTicker","E":1,"s":"BTCUSDT"}'],
    ['a ticker with a non-numeric price', '{"e":"24hrMiniTicker","E":1,"s":"BTCUSDT","c":"abc"}'],
    ['a ticker with a negative price', '{"e":"24hrMiniTicker","E":1,"s":"BTCUSDT","c":"-5"}'],
    ['a ticker with a zero price', '{"e":"24hrMiniTicker","E":1,"s":"BTCUSDT","c":"0"}'],
    ['a result without an id', '{"result":null}'],
  ])('ignores %s', (_label, raw) => {
    expect(parseSocketMessage(raw)).toEqual({ kind: 'ignored' })
  })

  it('ignores binary frames', () => {
    expect(parseSocketMessage(new ArrayBuffer(8))).toEqual({ kind: 'ignored' })
  })
})

describe('toStreamName', () => {
  it('lower-cases the symbol, because Binance silently ignores upper-case streams', () => {
    expect(toStreamName('BTCUSDT')).toBe('btcusdt@miniTicker')
  })
})

describe('buildRequest', () => {
  it('builds a SUBSCRIBE request with stream names', () => {
    expect(JSON.parse(buildRequest('SUBSCRIBE', ['BTCUSDT', 'ETHUSDT'], 7))).toEqual({
      method: 'SUBSCRIBE',
      params: ['btcusdt@miniTicker', 'ethusdt@miniTicker'],
      id: 7,
    })
  })
})
