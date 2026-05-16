import { describe, it, expect } from 'vitest'
import { generateUUID } from '../uuid'

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

describe('generateUUID', () => {
  it('returns a string', () => {
    expect(typeof generateUUID()).toBe('string')
  })

  it('matches UUID v4 format', () => {
    expect(generateUUID()).toMatch(UUID_V4_REGEX)
  })

  it('returns a unique value each call', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateUUID()))
    expect(ids.size).toBe(100)
  })
})
