import { describe, it, expect, afterEach, vi } from 'vitest'
import { isBotSession, isHeadlessBrowser } from '../bots'

const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

// jsdom reports screen.width/height as 0, which isHeadlessBrowser treats as headless.
// Patch screen dimensions before tests that need a non-headless environment.
function patchScreen(width = 1920, height = 1080): void {
  Object.defineProperty(window.screen, 'width', { value: width, configurable: true })
  Object.defineProperty(window.screen, 'height', { value: height, configurable: true })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('isBotSession', () => {
  it('returns true when navigator.userAgent contains Googlebot', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Googlebot/2.1 (+http://www.google.com/bot.html)',
      configurable: true,
    })
    expect(isBotSession()).toBe(true)
  })

  it('returns false for a normal Chrome UA', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: CHROME_UA,
      configurable: true,
    })
    Object.defineProperty(navigator, 'webdriver', {
      value: false,
      configurable: true,
    })
    patchScreen(1920, 1080)
    expect(isBotSession()).toBe(false)
  })
})

describe('isHeadlessBrowser', () => {
  it('returns true when navigator.webdriver is true', () => {
    Object.defineProperty(navigator, 'webdriver', {
      value: true,
      configurable: true,
    })
    expect(isHeadlessBrowser()).toBe(true)
  })

  it('returns false when navigator.webdriver is false and screen has dimensions', () => {
    Object.defineProperty(navigator, 'webdriver', {
      value: false,
      configurable: true,
    })
    patchScreen(1920, 1080)
    expect(isHeadlessBrowser()).toBe(false)
  })
})
