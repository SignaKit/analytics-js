import { describe, it, expect, beforeEach } from 'vitest'
import { buildPageContext, parseAndPersistUTM, buildDeviceContext } from '../context'

beforeEach(() => {
  sessionStorage.clear()
})

describe('buildPageContext', () => {
  it('returns object with location-matching fields', () => {
    const ctx = buildPageContext()
    expect(ctx.url).toBe(window.location.href)
    expect(ctx.path).toBe(window.location.pathname)
    expect(ctx.search).toBe(window.location.search)
    expect(ctx.hash).toBe(window.location.hash)
    expect(ctx.hostname).toBe(window.location.hostname)
    expect(typeof ctx.title).toBe('string')
  })

  it('referrer_url and referrer_domain are null by default in jsdom', () => {
    const ctx = buildPageContext()
    expect(ctx.referrer_url).toBeNull()
    expect(ctx.referrer_domain).toBeNull()
  })
})

describe('parseAndPersistUTM', () => {
  it('returns all-null context when no UTM params in URL', () => {
    const ctx = parseAndPersistUTM()
    expect(ctx.utm_source).toBeNull()
    expect(ctx.utm_medium).toBeNull()
    expect(ctx.utm_campaign).toBeNull()
    expect(ctx.gclid).toBeNull()
  })

  it('extracts utm_source, utm_medium, utm_campaign from URL search params', () => {
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        search: '?utm_source=google&utm_medium=cpc&utm_campaign=test',
      },
      configurable: true,
    })
    const ctx = parseAndPersistUTM()
    expect(ctx.utm_source).toBe('google')
    expect(ctx.utm_medium).toBe('cpc')
    expect(ctx.utm_campaign).toBe('test')
  })

  it('persists UTM to sessionStorage', () => {
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        search: '?utm_source=email',
      },
      configurable: true,
    })
    parseAndPersistUTM()
    const stored = sessionStorage.getItem('sk_utm')
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored!)
    expect(parsed.utm_source).toBe('email')
  })

  it('returns persisted UTM on subsequent call even after params removed', () => {
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        search: '?utm_source=twitter',
      },
      configurable: true,
    })
    parseAndPersistUTM()

    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        search: '',
      },
      configurable: true,
    })
    const ctx = parseAndPersistUTM()
    expect(ctx.utm_source).toBe('twitter')
  })

  it('extracts gclid from URL', () => {
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        search: '?gclid=abc123',
      },
      configurable: true,
    })
    const ctx = parseAndPersistUTM()
    expect(ctx.gclid).toBe('abc123')
  })
})

describe('buildDeviceContext', () => {
  it('returns an object with all required fields', () => {
    const ctx = buildDeviceContext()
    expect(typeof ctx.browser).toBe('string')
    expect(typeof ctx.browser_version).toBe('string')
    expect(typeof ctx.os).toBe('string')
    expect(typeof ctx.os_version).toBe('string')
    expect(['desktop', 'tablet', 'mobile']).toContain(ctx.device_type)
    expect(typeof ctx.screen_width).toBe('number')
    expect(typeof ctx.screen_height).toBe('number')
    expect(typeof ctx.viewport_width).toBe('number')
    expect(typeof ctx.viewport_height).toBe('number')
    expect(typeof ctx.language).toBe('string')
    expect(typeof ctx.timezone).toBe('string')
    expect(ctx.connection_type === null || typeof ctx.connection_type === 'string').toBe(true)
  })

  it('device_type is one of desktop | tablet | mobile', () => {
    const ctx = buildDeviceContext()
    expect(['desktop', 'tablet', 'mobile']).toContain(ctx.device_type)
  })
})
