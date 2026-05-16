import { describe, it, expect, beforeEach } from 'vitest'
import { getAnonymousId, clearAnonymousId } from '../anonymous'

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

beforeEach(() => {
  localStorage.clear()
})

describe('getAnonymousId', () => {
  it('returns a string on first call', () => {
    expect(typeof getAnonymousId()).toBe('string')
  })

  it('returns the same value on subsequent calls', () => {
    const first = getAnonymousId()
    const second = getAnonymousId()
    expect(second).toBe(first)
  })

  it('returns a new value after clearAnonymousId()', () => {
    const original = getAnonymousId()
    clearAnonymousId()
    const fresh = getAnonymousId()
    expect(fresh).not.toBe(original)
  })

  it('stored value matches UUID v4 format', () => {
    const id = getAnonymousId()
    expect(id).toMatch(UUID_V4_REGEX)
  })
})
