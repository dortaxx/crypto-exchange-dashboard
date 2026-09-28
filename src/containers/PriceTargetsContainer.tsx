import { useMemo, useState } from 'react'
import {
  PriceTargets,
  type NoteTone,
  type TargetView,
} from '../components/PriceTargets/PriceTargets'
import { parseAmount } from '../domain/amount'
import { formatPrice } from '../domain/format'
import { targetDirection, targetVerb } from '../domain/targets'
import type { Pair, PriceTarget } from '../domain/types'
import { useMarketStore } from '../store/marketStore'
import { usePreferencesStore } from '../store/preferencesStore'

type PriceTargetsContainerProps = {
  pairs: readonly Pair[]
}

type Check = {
  note: string
  tone: NoteTone
  target: Pick<PriceTarget, 'price' | 'direction'> | null
}

const problem = (note: string): Check => ({ note, tone: 'error', target: null })

function checkTarget(input: string, pair: Pair, current: number | undefined): Check {
  const parsed = parseAmount(input)
  const waiting: Check = {
    note:
      current === undefined
        ? `Waiting for ${pair.base}’s live price…`
        : `${pair.base} is at ${formatPrice(current)} now.`,
    tone: 'info',
    target: null,
  }

  if (!parsed.ok && parsed.reason === 'empty') return waiting
  if (!parsed.ok && parsed.reason === 'negative') return problem('Prices can’t be negative.')
  if (!parsed.ok) return problem('Enter a price, like 85000.')
  if (parsed.value === 0) return problem('Enter a price above zero.')
  if (current === undefined) return waiting

  const direction = targetDirection(current, parsed.value)
  if (direction === null) return problem(`${pair.base} is already at that price.`)
  return {
    note: `Alerts when ${pair.base} ${targetVerb(direction)} ${formatPrice(parsed.value)} · now ${formatPrice(current)}`,
    tone: 'info',
    target: { price: parsed.value, direction },
  }
}

export function PriceTargetsContainer({ pairs }: PriceTargetsContainerProps) {
  const targets = usePreferencesStore((state) => state.targets)
  const addTarget = usePreferencesStore((state) => state.addTarget)
  const removeTargets = usePreferencesStore((state) => state.removeTargets)
  const [assetChoice, setAssetChoice] = useState<string | null>(null)
  const [value, setValue] = useState('')
  const pair = pairs.find((candidate) => candidate.base === assetChoice) ?? pairs[0]
  const current = useMarketStore((state) => (pair ? state.prices[pair.symbol]?.price : undefined))
  const assets = useMemo(() => pairs.map((item) => ({ code: item.base, name: item.name })), [pairs])

  if (pair === undefined) return null

  const check = checkTarget(value, pair, current)
  const views: TargetView[] = targets.map((target) => ({
    id: target.id,
    asset: pairs.find((item) => item.symbol === target.symbol)?.base ?? target.symbol,
    direction: target.direction,
    price: formatPrice(target.price),
  }))

  return (
    <PriceTargets
      assets={assets}
      asset={pair.base}
      value={value}
      note={check.note}
      tone={check.tone}
      canAdd={check.target !== null}
      targets={views}
      onAssetChange={setAssetChoice}
      onValueChange={setValue}
      onAdd={() => {
        if (check.target === null) return
        addTarget({ symbol: pair.symbol, ...check.target })
        setValue('')
      }}
      onRemove={(id) => {
        removeTargets([id])
      }}
    />
  )
}
