import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { CoinIcon } from '../CoinIcon/CoinIcon'
import styles from './AssetPicker.module.css'

export type AssetOption = {
  code: string
  name: string
}

type AssetPickerProps = {
  label: string
  value: string
  assets: readonly AssetOption[]
  onChange: (code: string) => void
}

export function AssetPicker({ label, value, assets, onChange }: AssetPickerProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listId = useId()
  const optionId = (index: number) => `${listId}-option-${index}`

  useEffect(() => {
    if (!open) return
    listRef.current?.focus()
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return
      if (triggerRef.current?.contains(event.target) || listRef.current?.contains(event.target)) {
        return
      }
      setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsidePointer)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    document.getElementById(`${listId}-option-${activeIndex}`)?.scrollIntoView({ block: 'nearest' })
  }, [open, activeIndex, listId])

  const openList = () => {
    setActiveIndex(
      Math.max(
        0,
        assets.findIndex((asset) => asset.code === value),
      ),
    )
    setOpen(true)
  }

  const close = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }

  const choose = (index: number) => {
    const asset = assets[index]
    if (asset !== undefined) onChange(asset.code)
    close()
  }

  const onTriggerKeyDown = (event: KeyboardEvent) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault()
      openList()
    }
  }

  const onListKeyDown = (event: KeyboardEvent) => {
    const last = assets.length - 1
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActiveIndex((index) => Math.min(index + 1, last))
        return
      case 'ArrowUp':
        event.preventDefault()
        setActiveIndex((index) => Math.max(index - 1, 0))
        return
      case 'Home':
        event.preventDefault()
        setActiveIndex(0)
        return
      case 'End':
        event.preventDefault()
        setActiveIndex(last)
        return
      case 'Enter':
      case ' ':
        event.preventDefault()
        choose(activeIndex)
        return
      case 'Escape':
        event.preventDefault()
        close()
        return
      case 'Tab':
        setOpen(false)
        return
      default: {
        if (event.key.length !== 1) return
        const letter = event.key.toUpperCase()
        const match = assets.findIndex((asset) => asset.code.startsWith(letter))
        if (match !== -1) setActiveIndex(match)
      }
    }
  }

  return (
    <div className={styles.picker}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`${label}: ${value}`}
        onClick={() => {
          if (open) close()
          else openList()
        }}
        onKeyDown={onTriggerKeyDown}
      >
        <CoinIcon asset={value} />
        <span className={styles.value}>{value}</span>
        <svg className={styles.chevron} data-open={open} viewBox="0 0 12 12" aria-hidden="true">
          <path d="M3 4.5 6 7.5 9 4.5" />
        </svg>
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={label}
          aria-activedescendant={optionId(activeIndex)}
          tabIndex={-1}
          className={styles.list}
          onKeyDown={onListKeyDown}
        >
          {assets.map((asset, index) => (
            <li
              key={asset.code}
              id={optionId(index)}
              role="option"
              aria-selected={asset.code === value}
              data-active={index === activeIndex}
              className={styles.option}
              onPointerEnter={() => {
                setActiveIndex(index)
              }}
              onClick={() => {
                choose(index)
              }}
            >
              <CoinIcon asset={asset.code} />
              <span className={styles.code}>{asset.code}</span>
              <span className={styles.name}>{asset.name}</span>
              {asset.code === value && (
                <svg className={styles.check} viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M2.5 6.5 5 9l4.5-6" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
