import { useState } from 'react'
import type { CoinOption } from '../components/CoinSelect/CoinSelect'
import { Converter } from '../components/Converter/Converter'
import { parseAmount } from '../domain/amount'
import { convert, priceInUsdt, QUOTE_ASSET } from '../domain/convert'
import { formatAmount } from '../domain/format'
import type { Pair } from '../domain/types'
import { useMarketStore } from '../store/marketStore'

type ConverterContainerProps = {
  pairs: readonly Pair[]
}

export function ConverterContainer({ pairs }: ConverterContainerProps) {
  const assets: CoinOption[] = [
    ...pairs.map((pair) => ({ code: pair.base, name: pair.name })),
    { code: QUOTE_ASSET, name: 'Tether' },
  ]
  const [fromChoice, setFrom] = useState(assets[0]?.code ?? QUOTE_ASSET)
  const [toChoice, setTo] = useState(assets[1]?.code ?? QUOTE_ASSET)
  const [amount, setAmount] = useState('1')

  const available = (code: string) => assets.some((asset) => asset.code === code)
  const from = available(fromChoice) ? fromChoice : QUOTE_ASSET
  const to = available(toChoice) ? toChoice : QUOTE_ASSET

  const fromPrice = useMarketStore((state) => priceInUsdt(from, state.prices))
  const toPrice = useMarketStore((state) => priceInUsdt(to, state.prices))

  const parsed = parseAmount(amount)
  const result =
    parsed.ok && fromPrice !== undefined && toPrice !== undefined
      ? formatAmount(convert(parsed.value, fromPrice, toPrice))
      : null

  let message: string | null = null
  if (!parsed.ok && parsed.reason === 'negative') message = 'Amounts can’t be negative.'
  if (!parsed.ok && parsed.reason === 'invalid') message = 'Enter a number, like 0.5'

  return (
    <Converter
      assets={assets}
      from={from}
      to={to}
      amount={amount}
      result={result}
      message={message}
      onAmountChange={setAmount}
      onFromChange={setFrom}
      onToChange={setTo}
      onSwap={() => {
        setFrom(to)
        setTo(from)
      }}
    />
  )
}
