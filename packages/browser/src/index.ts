import type { SignakitAnalyticsConfig, SignakitAnalyticsInstance } from '@signakit/analytics-core'
import { SignakitClient } from './client'

interface SignakitAnalytics extends SignakitAnalyticsInstance {
  destroy(): void
}

let _client: SignakitClient | null = null

const signakitAnalytics = {
  init(apiKey: string, options?: SignakitAnalyticsConfig): void {
    _client = new SignakitClient({ ...options, apiKey })
    _client.init()
  },

  track(event: string, properties?: Record<string, unknown>): void {
    _client?.track(event, properties)
  },

  page(properties?: Record<string, unknown>): void {
    _client?.page(properties)
  },

  identify(userId: string, traits?: Record<string, unknown>): void {
    _client?.identify(userId, traits)
  },

  reset(): void {
    _client?.reset()
  },

  enable(): void {
    _client?.enable()
  },

  disable(): void {
    _client?.disable()
  },

  optIn(): void {
    _client?.optIn()
  },

  optOut(): void {
    _client?.optOut()
  },

  async flush(): Promise<void> {
    await _client?.flush()
  },

  getAnonymousId(): string {
    return _client?.getAnonymousId() ?? ''
  },

  getSessionId(): string {
    return _client?.getSessionId() ?? ''
  },

  destroy(): void {
    _client?.destroy()
    _client = null
  },
} satisfies SignakitAnalytics

export default signakitAnalytics
