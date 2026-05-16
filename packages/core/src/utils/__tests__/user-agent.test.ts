import { describe, it, expect } from 'vitest'
import { detectBrowser, detectBrowserVersion, detectOS, detectDeviceType } from '../user-agent'

const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
const FIREFOX_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0'
const SAFARI_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15'
const EDGE_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0'
const OPERA_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 OPR/110.0.0.0'
const SAMSUNG_UA =
  'Mozilla/5.0 (Linux; Android 13; SAMSUNG SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36'
const IPHONE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1'
const IPAD_UA =
  'Mozilla/5.0 (iPad; CPU OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1'
const ANDROID_UA =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36'
const CURL_UA = 'curl/7.68.0'

describe('detectBrowser', () => {
  it('detects Chrome', () => {
    expect(detectBrowser(CHROME_UA, 'Google Inc.')).toBe('Chrome')
  })

  it('detects Firefox', () => {
    expect(detectBrowser(FIREFOX_UA, '')).toBe('Firefox')
  })

  it('detects Safari', () => {
    expect(detectBrowser(SAFARI_UA, 'Apple Computer, Inc.')).toBe('Safari')
  })

  it('detects Microsoft Edge', () => {
    expect(detectBrowser(EDGE_UA, 'Google Inc.')).toBe('Microsoft Edge')
  })

  it('detects Opera', () => {
    expect(detectBrowser(OPERA_UA, '')).toBe('Opera')
  })

  it('detects Samsung Internet', () => {
    expect(detectBrowser(SAMSUNG_UA, '')).toBe('Samsung Internet')
  })

  it('returns empty string for unknown UA', () => {
    expect(detectBrowser(CURL_UA, '')).toBe('')
  })
})

describe('detectBrowserVersion', () => {
  it('returns a number for Chrome UA', () => {
    const version = detectBrowserVersion(CHROME_UA, 'Google Inc.')
    expect(typeof version).toBe('number')
    expect(version).toBe(124)
  })

  it('returns a number for Firefox UA', () => {
    const version = detectBrowserVersion(FIREFOX_UA, '')
    expect(typeof version).toBe('number')
    expect(version).toBe(124)
  })

  it('returns null for unknown UA', () => {
    expect(detectBrowserVersion(CURL_UA, '')).toBeNull()
  })
})

describe('detectOS', () => {
  it('detects Windows 10', () => {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    expect(detectOS(ua)).toEqual(['Windows', '10'])
  })

  it('detects macOS with version', () => {
    const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    expect(detectOS(ua)).toEqual(['Mac OS X', '10.15.7'])
  })

  it('detects iOS with version', () => {
    const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15'
    expect(detectOS(ua)).toEqual(['iOS', '17.4.1'])
  })

  it('detects Android with version', () => {
    // Android 14 with only major version — regex requires major.minor to capture version
    const ua = 'Mozilla/5.0 (Linux; Android 14.0; Pixel 8) AppleWebKit/537.36'
    expect(detectOS(ua)).toEqual(['Android', '14.0.0'])
  })

  it('detects Linux', () => {
    const ua = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
    expect(detectOS(ua)).toEqual(['Linux', ''])
  })

  it('detects Chrome OS', () => {
    const ua = 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36'
    expect(detectOS(ua)).toEqual(['Chrome OS', ''])
  })

  it('returns empty strings for unknown UA', () => {
    expect(detectOS(CURL_UA)).toEqual(['', ''])
  })
})

describe('detectDeviceType', () => {
  it('returns desktop for Chrome desktop UA', () => {
    expect(detectDeviceType(CHROME_UA)).toBe('desktop')
  })

  it('returns mobile for iPhone UA', () => {
    expect(detectDeviceType(IPHONE_UA)).toBe('mobile')
  })

  it('returns tablet for iPad UA', () => {
    expect(detectDeviceType(IPAD_UA)).toBe('tablet')
  })

  it('returns mobile for Android mobile UA', () => {
    expect(detectDeviceType(ANDROID_UA)).toBe('mobile')
  })

  it('returns tablet for Android tablet hint with large screen', () => {
    // shortSideDp = min(1200, 1800) / 1 = 1200 >= 600 → tablet
    expect(
      detectDeviceType(CHROME_UA, {
        userAgentDataPlatform: 'Android',
        maxTouchPoints: 5,
        screenWidth: 1200,
        screenHeight: 1800,
        devicePixelRatio: 1,
      })
    ).toBe('tablet')
  })

  it('returns mobile for Android phone hint with small screen', () => {
    // shortSideDp = min(360, 800) / 3 = 120 < 600 → mobile
    expect(
      detectDeviceType(CHROME_UA, {
        userAgentDataPlatform: 'Android',
        maxTouchPoints: 5,
        screenWidth: 360,
        screenHeight: 800,
        devicePixelRatio: 3,
      })
    ).toBe('mobile')
  })
})
