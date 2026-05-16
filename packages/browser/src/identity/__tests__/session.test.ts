import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { getSessionId, clearSession } from '../session'

beforeEach(() => {
  sessionStorage.clear()
  vi.restoreAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getSessionId', () => {
  it('returns a string on first call', () => {
    expect(typeof getSessionId()).toBe('string')
  })

  it('returns the same session ID on subsequent calls within timeout', () => {
    const first = getSessionId()
    const second = getSessionId()
    expect(second).toBe(first)
  })

  it('clearSession() causes a new ID to be generated', () => {
    const original = getSessionId()
    clearSession()
    const fresh = getSessionId()
    expect(fresh).not.toBe(original)
  })

  it('after clearing, new ID is different from old', () => {
    const first = getSessionId()
    clearSession()
    const second = getSessionId()
    expect(second).not.toBe(first)
    expect(typeof second).toBe('string')
    expect(second.length).toBeGreaterThan(0)
  })

  it('returns a new ID after session timeout', () => {
    const original = getSessionId()
    const thirtyOneMinutes = 31 * 60 * 1000
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + thirtyOneMinutes)
    const fresh = getSessionId()
    expect(fresh).not.toBe(original)
  })
})
