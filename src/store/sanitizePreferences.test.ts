import { describe, expect, it } from 'vitest'
import { sanitizePreferences, type SavedPreferences } from './sanitizePreferences'

const defaults: SavedPreferences = {
  pairs: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'],
  favorites: [],
  hidden: [],
  view: 'all',
  sortKey: 'name',
  sortDirection: 'asc',
}
const known = new Set(['BTCUSDT', 'ETHUSDT', 'SOLUSDT'])

describe('sanitizePreferences', () => {
  it('keeps valid saved preferences', () => {
    const saved = {
      pairs: ['SOLUSDT', 'BTCUSDT'],
      favorites: ['BTCUSDT'],
      hidden: ['SOLUSDT'],
      view: 'favorites',
      sortKey: 'change',
      sortDirection: 'desc',
    }
    expect(sanitizePreferences(saved, defaults, known)).toEqual(saved)
  })

  it('drops symbols the app no longer knows and duplicates', () => {
    const saved = { ...defaults, favorites: ['BTCUSDT', 'DOGEUSDT', 'BTCUSDT', 42] }
    expect(sanitizePreferences(saved, defaults, known).favorites).toEqual(['BTCUSDT'])
  })

  it('falls back to defaults for unknown or corrupted values', () => {
    const saved = { favorites: 'BTCUSDT', hidden: null, view: 'grid', sortKey: 7 }
    expect(sanitizePreferences(saved, defaults, known)).toEqual(defaults)
  })

  it('falls back to the default pairs when none of the saved pairs are usable', () => {
    expect(sanitizePreferences({ pairs: [] }, defaults, known).pairs).toEqual(defaults.pairs)
    expect(sanitizePreferences({ pairs: ['DOGEUSDT'] }, defaults, known).pairs).toEqual(
      defaults.pairs,
    )
  })

  it('forgets favorites and hidden pairs that are no longer tracked', () => {
    const saved = { ...defaults, pairs: ['BTCUSDT'], favorites: ['ETHUSDT'], hidden: ['SOLUSDT'] }
    expect(sanitizePreferences(saved, defaults, known)).toMatchObject({
      pairs: ['BTCUSDT'],
      favorites: [],
      hidden: [],
    })
  })

  it('returns the defaults when nothing usable was saved', () => {
    expect(sanitizePreferences('garbage', defaults, known)).toEqual(defaults)
    expect(sanitizePreferences(undefined, defaults, known)).toEqual(defaults)
  })
})
