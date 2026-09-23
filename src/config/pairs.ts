import type { Pair } from '../domain/types'

const usdtPair = (base: string, name: string): Pair => ({
  symbol: `${base}USDT`,
  base,
  quote: 'USDT',
  name,
})

export const PAIR_CATALOG: readonly Pair[] = [
  usdtPair('BTC', 'Bitcoin'),
  usdtPair('ETH', 'Ethereum'),
  usdtPair('SOL', 'Solana'),
  usdtPair('BNB', 'BNB'),
  usdtPair('XRP', 'XRP'),
  usdtPair('ADA', 'Cardano'),
  usdtPair('DOGE', 'Dogecoin'),
  usdtPair('TRX', 'TRON'),
  usdtPair('AVAX', 'Avalanche'),
  usdtPair('DOT', 'Polkadot'),
  usdtPair('LINK', 'Chainlink'),
  usdtPair('LTC', 'Litecoin'),
  usdtPair('BCH', 'Bitcoin Cash'),
  usdtPair('XLM', 'Stellar'),
  usdtPair('ATOM', 'Cosmos'),
  usdtPair('UNI', 'Uniswap'),
  usdtPair('ETC', 'Ethereum Classic'),
  usdtPair('FIL', 'Filecoin'),
]

const DEFAULT_SYMBOLS: readonly string[] = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT']

export const DEFAULT_PAIRS: readonly Pair[] = PAIR_CATALOG.filter((pair) =>
  DEFAULT_SYMBOLS.includes(pair.symbol),
)
