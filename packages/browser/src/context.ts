import { detectBrowser, detectBrowserVersion, detectOS, detectDeviceType } from '@signakit/analytics-core'
import type { DeviceType } from '@signakit/analytics-core'
import { session as sessionStore } from './utils/storage'

const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const
const CLICK_IDS = ['gclid', 'msclkid', 'fbclid', 'twclid', 'igshid', 'li_fat_id'] as const
const UTM_STORAGE_KEY = 'sk_utm'

export interface PageContext {
  url: string
  path: string
  search: string
  hash: string
  hostname: string
  referrer_url: string | null
  referrer_domain: string | null
  title: string
}

export interface UTMContext {
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_term: string | null
  utm_content: string | null
  gclid: string | null
  msclkid: string | null
  fbclid: string | null
  twclid: string | null
  igshid: string | null
  li_fat_id: string | null
}

export interface DeviceContext {
  browser: string
  browser_version: string
  os: string
  os_version: string
  device_type: DeviceType
  screen_width: number
  screen_height: number
  viewport_width: number
  viewport_height: number
  language: string
  timezone: string
  connection_type: string | null
}

export function buildPageContext(): PageContext {
  const referrer = document.referrer || null
  let referrer_domain: string | null = null
  if (referrer) {
    try {
      referrer_domain = new URL(referrer).hostname
    } catch {
      // malformed referrer
    }
  }
  return {
    url: location.href,
    path: location.pathname,
    search: location.search,
    hash: location.hash,
    hostname: location.hostname,
    referrer_url: referrer,
    referrer_domain,
    title: document.title,
  }
}

export function parseAndPersistUTM(): UTMContext {
  const params = new URLSearchParams(location.search)
  const hasUTM = UTM_PARAMS.some((k) => params.has(k)) || CLICK_IDS.some((k) => params.has(k))

  if (hasUTM) {
    const fresh: UTMContext = {
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      utm_term: params.get('utm_term'),
      utm_content: params.get('utm_content'),
      gclid: params.get('gclid'),
      msclkid: params.get('msclkid'),
      fbclid: params.get('fbclid'),
      twclid: params.get('twclid'),
      igshid: params.get('igshid'),
      li_fat_id: params.get('li_fat_id'),
    }
    sessionStore.set(UTM_STORAGE_KEY, JSON.stringify(fresh))
    return fresh
  }

  const stored = sessionStore.get(UTM_STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored) as UTMContext
    } catch {
      // malformed stored UTM
    }
  }

  return {
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_term: null,
    utm_content: null,
    gclid: null,
    msclkid: null,
    fbclid: null,
    twclid: null,
    igshid: null,
    li_fat_id: null,
  }
}

export function buildDeviceContext(): DeviceContext {
  const ua = navigator.userAgent
  const vendor = navigator.vendor

  const browserName = detectBrowser(ua, vendor)
  const browserVersion = detectBrowserVersion(ua, vendor)
  const [osName, osVersion] = detectOS(ua)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav = navigator as any
  const device_type = detectDeviceType(ua, {
    userAgentDataPlatform: nav.userAgentData?.platform,
    maxTouchPoints: navigator.maxTouchPoints,
    screenWidth: screen.width,
    screenHeight: screen.height,
    devicePixelRatio: window.devicePixelRatio,
  })

  const connection_type: string | null = nav.connection?.effectiveType ?? null

  return {
    browser: browserName,
    browser_version: browserVersion !== null ? String(browserVersion) : '',
    os: osName,
    os_version: osVersion,
    device_type,
    screen_width: screen.width,
    screen_height: screen.height,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    connection_type,
  }
}
