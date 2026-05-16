import type { SignakitAnalyticsConfig, RawEvent } from '@signakit/analytics-core'
import { generateUUID } from './utils/uuid'
import { getAnonymousId, clearAnonymousId } from './identity/anonymous'
import {
  getOrCreateSession,
  getSessionId,
  clearSession,
  touchSession,
  incrementPageviewCount,
  getSessionMeta,
} from './identity/session'
import { buildPageContext, parseAndPersistUTM, buildDeviceContext } from './context'
import { ConsentManager } from './filters/consent'
import { isBotSession } from './filters/bots'
import { EventBatcher } from './delivery/batcher'
import { mountAll, unmountAll } from './autocapture/index'

import { version } from '../package.json'

const SDK_NAME = 'analytics-js'
const SDK_VERSION = version
const DEFAULT_ENDPOINT = 'https://60amq9ozsf.execute-api.us-east-2.amazonaws.com/v1/analytics'

export class SignakitClient {
  private readonly config: Required<SignakitAnalyticsConfig> & { apiKey: string }
  private readonly consent: ConsentManager
  private readonly batcher: EventBatcher
  private userId: string | null = null
  private userTraits: Record<string, unknown> = {}
  private _isBot: boolean = false

  constructor(config: SignakitAnalyticsConfig & { apiKey: string }) {
    this.config = {
      apiKey: config.apiKey,
      defaults: config.defaults ?? new Date().toISOString().slice(0, 10),
      endpoint: config.endpoint ?? DEFAULT_ENDPOINT,
      autoCapture: config.autoCapture ?? {},
      consent: config.consent ?? 'none',
      cookieless: config.cookieless ?? true,
      blockHostnames: config.blockHostnames ?? ['localhost', '127.0.0.1'],
      blockBots: config.blockBots ?? true,
      sampleRate: config.sampleRate ?? 1,
      batchSize: config.batchSize ?? 20,
      flushInterval: config.flushInterval ?? 5000,
      debug: config.debug ?? false,
    }

    this.consent = new ConsentManager(this.config.consent)

    this.batcher = new EventBatcher({
      endpoint: this.config.endpoint,
      batchSize: this.config.batchSize,
      flushInterval: this.config.flushInterval,
      debug: this.config.debug,
    })
  }

  init(): void {
    if (this._isBlockedHostname()) return

    this._isBot = this.config.blockBots ? isBotSession() : false
    if (this._isBot) return

    if (this.config.sampleRate < 1 && Math.random() > this.config.sampleRate) return

    this.batcher.start()
    void this.batcher.replayOffline()

    parseAndPersistUTM()

    const { isNew } = getOrCreateSession()
    if (isNew) {
      this.dispatch({ event_name: 'session_start' })
    }

    window.addEventListener('pagehide', this._onPageHide)

    mountAll(this, this.config.autoCapture)
  }

  private _onPageHide = (): void => {
    const meta = getSessionMeta()
    this.dispatch({ event_name: 'session_end', ...meta })
    void this.batcher.flush(true)
  }

  destroy(): void {
    window.removeEventListener('pagehide', this._onPageHide)
    unmountAll()
    this.batcher.stop()
    const meta = getSessionMeta()
    this.dispatch({ event_name: 'session_end', ...meta })
    void this.batcher.flush(true)
  }

  track(event: string, properties?: Record<string, unknown>): void {
    this.dispatch({ event_name: event, ...properties })
  }

  page(properties?: Record<string, unknown>): void {
    incrementPageviewCount()
    const page = buildPageContext()
    this.dispatch({ event_name: 'pageview', ...page, ...properties })
  }

  identify(userId: string, traits?: Record<string, unknown>): void {
    this.userId = userId
    this.userTraits = traits ?? {}
    this.dispatch({ event_name: 'identify', user_id: userId, ...traits })
  }

  reset(): void {
    this.userId = null
    this.userTraits = {}
    clearAnonymousId()
    clearSession()
  }

  enable(): void {
    this.consent.enable()
  }

  disable(): void {
    this.consent.disable()
  }

  optIn(): void {
    this.consent.optIn()
  }

  optOut(): void {
    this.consent.optOut()
  }

  async flush(): Promise<void> {
    await this.batcher.flush()
  }

  flushBeacon(useBeacon: boolean): void {
    void this.batcher.flush(useBeacon)
  }

  getAnonymousId(): string {
    return getAnonymousId()
  }

  getSessionId(): string {
    return getSessionId()
  }

  dispatch(partial: { event_name: string } & Record<string, unknown>): void {
    if (!this.consent.isEnabled) return

    const page = buildPageContext()
    const device = buildDeviceContext()
    const utm = parseAndPersistUTM()

    touchSession()

    const event: RawEvent = {
      event_id: generateUUID(),
      timestamp: new Date().toISOString(),
      session_id: getSessionId(),
      anonymous_id: getAnonymousId(),
      user_id: this.userId,
      sdk_name: SDK_NAME,
      sdk_version: SDK_VERSION,
      ...this.userTraits,
      ...page,
      ...utm,
      ...device,
      ...partial,
    }

    this.batcher.push(event)
  }

  private _isBlockedHostname(): boolean {
    return this.config.blockHostnames.some((pattern) => {
      if (pattern.startsWith('*.')) {
        return location.hostname.endsWith(pattern.slice(1))
      }
      return location.hostname === pattern
    })
  }
}
