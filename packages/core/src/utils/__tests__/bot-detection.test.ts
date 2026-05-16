import { describe, it, expect } from 'vitest'
import { isBlockedUserAgent, BLOCKED_UA_STRINGS } from '../bot-detection'

const CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
const FIREFOX_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0'
const SAFARI_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15'

describe('BLOCKED_UA_STRINGS', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(BLOCKED_UA_STRINGS)).toBe(true)
    expect(BLOCKED_UA_STRINGS.length).toBeGreaterThan(0)
  })

  it('contains googlebot', () => {
    expect(BLOCKED_UA_STRINGS).toContain('googlebot')
  })
})

describe('isBlockedUserAgent', () => {
  it('returns false for undefined', () => {
    expect(isBlockedUserAgent(undefined)).toBe(false)
  })

  it('returns false for a normal Chrome UA', () => {
    expect(isBlockedUserAgent(CHROME_UA)).toBe(false)
  })

  it('returns false for a normal Firefox UA', () => {
    expect(isBlockedUserAgent(FIREFOX_UA)).toBe(false)
  })

  it('returns false for a normal Safari UA', () => {
    expect(isBlockedUserAgent(SAFARI_UA)).toBe(false)
  })

  it('returns true for Googlebot', () => {
    expect(isBlockedUserAgent('Googlebot/2.1 (+http://www.google.com/bot.html)')).toBe(true)
  })

  it('returns true for bingbot', () => {
    expect(
      isBlockedUserAgent(
        'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'
      )
    ).toBe(true)
  })

  it('returns true for GPTBot', () => {
    expect(isBlockedUserAgent('GPTBot/1.0 (+https://openai.com/gptbot)')).toBe(true)
  })

  it('returns true for claudebot', () => {
    expect(isBlockedUserAgent('claudebot')).toBe(true)
  })

  it('returns true for HeadlessChrome', () => {
    expect(isBlockedUserAgent('Mozilla/5.0 HeadlessChrome/120.0')).toBe(true)
  })

  it('is case-insensitive — GOOGLEBOT returns true', () => {
    expect(isBlockedUserAgent('GOOGLEBOT')).toBe(true)
  })

  it('uses custom blocklist', () => {
    expect(isBlockedUserAgent('myinternalbot/1.0', ['myinternalbot'])).toBe(true)
  })
})
