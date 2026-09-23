import { PairTable } from '../components/PairTable/PairTable'
import type { Pair } from '../domain/types'
import { useMarketStore } from '../store/marketStore'

type PairTableContainerProps = {
  pairs: readonly Pair[]
}

export function PairTableContainer({ pairs }: PairTableContainerProps) {
  const tickers = useMarketStore((state) => state.tickers)
  const status = useMarketStore((state) => state.snapshotStatus)

  return <PairTable pairs={pairs} tickers={tickers} status={status} />
}
