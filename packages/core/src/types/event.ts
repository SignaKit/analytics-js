export type DeviceType = 'desktop' | 'tablet' | 'mobile'
export type MetricName = 'LCP' | 'FCP' | 'CLS' | 'INP' | 'TTFB'
export type MetricRating = 'good' | 'needs-improvement' | 'poor'
export type BotConfidence = 'low' | 'high'
export type ConsentMode = 'none' | 'opt-out' | 'opt-in'

export interface RawEvent {
  // Standard fields
  event_id: string
  event_name: string
  event_type?: string
  timestamp: string
  session_id: string
  anonymous_id: string
  user_id: string | null
  sdk_name: string
  sdk_version: string
  bot_confidence?: BotConfidence

  // Page context
  url: string
  path: string
  search: string
  hash: string
  hostname: string
  referrer_url: string | null
  referrer_domain: string | null
  title: string

  // UTM & click IDs
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

  // Device & browser
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

  // Server-side enrichment (added at ingest, not set by the client)
  ip_address?: string
  geo_country?: string
  geo_city?: string
  geo_region?: string

  // Event-specific properties (merged in for custom events)
  [key: string]: unknown
}

export type PartialRawEvent = Omit<
  RawEvent,
  | 'event_id'
  | 'timestamp'
  | 'session_id'
  | 'anonymous_id'
  | 'user_id'
  | 'sdk_name'
  | 'sdk_version'
  | 'url'
  | 'path'
  | 'search'
  | 'hash'
  | 'hostname'
  | 'referrer_url'
  | 'referrer_domain'
  | 'title'
  | 'utm_source'
  | 'utm_medium'
  | 'utm_campaign'
  | 'utm_term'
  | 'utm_content'
  | 'gclid'
  | 'msclkid'
  | 'fbclid'
  | 'twclid'
  | 'igshid'
  | 'li_fat_id'
  | 'browser'
  | 'browser_version'
  | 'os'
  | 'os_version'
  | 'device_type'
  | 'screen_width'
  | 'screen_height'
  | 'viewport_width'
  | 'viewport_height'
  | 'language'
  | 'timezone'
  | 'connection_type'
>
