export interface AutoCaptureConfig {
  interaction?: boolean
  navigation?: boolean
  clipboard?: boolean
  deadClicks?: boolean
  rageClicks?: boolean
  scrollDepth?: boolean
  webVitals?: boolean
  outboundClicks?: boolean
  formEvents?: boolean
}

export interface SignakitAnalyticsConfig {
  defaults?: string
  endpoint?: string
  autoCapture?: AutoCaptureConfig
  consent?: 'none' | 'opt-out' | 'opt-in'
  cookieless?: boolean
  blockHostnames?: string[]
  blockBots?: boolean
  sampleRate?: number
  batchSize?: number
  flushInterval?: number
  debug?: boolean
}

export interface SignakitAnalyticsInstance {
  init(apiKey: string, options?: SignakitAnalyticsConfig): void
  track(event: string, properties?: Record<string, unknown>): void
  page(properties?: Record<string, unknown>): void
  identify(userId: string, traits?: Record<string, unknown>): void
  reset(): void
  enable(): void
  disable(): void
  optIn(): void
  optOut(): void
  flush(): Promise<void>
  getAnonymousId(): string
  getSessionId(): string
}
