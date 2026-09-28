import { useMemo, useState } from 'react'
import { Converter, type AssetOption, type QuickAmount } from '../components/Converter/Converter'
import { parseAmount } from '../domain/amount'
import { convert, priceInUsdt, QUOTE_ASSET } from '../domain/convert'
import { formatAmount } from '../domain/format'
import type { Pair } from '../domain/types'
import { useMarketStore } from '../store/marketStore'

const COIN_QUICK_AMOUNTS = ['0.1', '0.5', '1', '5']
const USDT_QUICK_AMOUNTS = ['100', '500', '1000', '5000']

type ConverterContainerProps = {
  pairs: readonly Pair[]
}

export function ConverterContainer({ pairs }: ConverterContainerProps) {
  const assets = useMemo<AssetOption[]>(
    () => [
      ...pairs.map((pair) => ({ code: pair.base, name: pair.name })),
      { code: QUOTE_ASSET, name: 'Tether' },
    ],
    [pairs],
  )
  const [fromChoice, setFrom] = useState(assets[0]?.code ?? QUOTE_ASSET)
  const [toChoice, setTo] = useState(assets[1]?.code ?? QUOTE_ASSET)
  const [amount, setAmount] = useState('1')

  const available = (code: string) => assets.some((asset) => asset.code === code)
  const from = available(fromChoice)
    ? fromChoice
    : (assets.find((asset) => asset.code !== toChoice)?.code ?? QUOTE_ASSET)
  const to = available(toChoice)
    ? toChoice
    : (assets.find((asset) => asset.code !== from)?.code ?? QUOTE_ASSET)

  const fromPrice = useMarketStore((state) => priceInUsdt(from, state.prices))
  const toPrice = useMarketStore((state) => priceInUsdt(to, state.prices))

  const parsed = parseAmount(amount)

  let result: string | null = null
  let rate: string | null = null
  if (fromPrice !== undefined && toPrice !== undefined) {
    rate = `1 ${from} = ${formatAmount(convert(1, fromPrice, toPrice))} ${to}`
    if (parsed.ok) result = formatAmount(convert(parsed.value, fromPrice, toPrice))
  }

  let message: string | null = null
  if (!parsed.ok && parsed.reason === 'negative') message = 'Amounts can’t be negative.'
  if (!parsed.ok && parsed.reason === 'invalid') message = 'Enter a number, like 0.5'

  const quickAmounts: QuickAmount[] = (
    from === QUOTE_ASSET ? USDT_QUICK_AMOUNTS : COIN_QUICK_AMOUNTS
  ).map((value) => ({ label: `${value} ${from}`, value }))

  return (
    <Converter
      assets={assets}
      from={from}
      to={to}
      amount={amount}
      result={result}
      rate={rate}
      message={message}
      quickAmounts={quickAmounts}
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
