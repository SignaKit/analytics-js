import { describe, it, expect, vi, afterEach } from 'vitest'
import { local, session } from '../storage'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('local storage wrapper', () => {
  it('round-trips a value via set and get', () => {
    local.set('test_key', 'hello')
    expect(local.get('test_key')).toBe('hello')
  })

  it('returns null for a missing key', () => {
    expect(local.get('nonexistent_key_xyz')).toBeNull()
  })

  it('removes a key', () => {
    local.set('to_remove', 'value')
    local.remove('to_remove')
    expect(local.get('to_remove')).toBeNull()
  })

  it('does not throw when localStorage.setItem throws', () => {
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('storage full')
    })
    expect(() => local.set('any_key', 'any_value')).not.toThrow()
  })
})

describe('session storage wrapper', () => {
  it('round-trips a value via set and get', () => {
    session.set('sess_key', 'world')
    expect(session.get('sess_key')).toBe('world')
  })

  it('removes a key', () => {
    session.set('sess_remove', 'value')
    session.remove('sess_remove')
    expect(session.get('sess_remove')).toBeNull()
  })
})
