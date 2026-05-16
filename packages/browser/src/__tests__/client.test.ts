import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('../autocapture/index', () => ({ mountAll: vi.fn(), unmountAll: vi.fn() }))
vi.mock('../delivery/transport', () => ({ sendBatch: vi.fn().mockResolvedValue(true) }))

const mockFlush = vi.fn().mockResolvedValue(undefined)
const mockPush = vi.fn()
const mockStart = vi.fn()
const mockReplayOffline = vi.fn().mockResolvedValue(undefined)

vi.mock('../delivery/batcher', () => {
  class MockEventBatcher {
    start = mockStart
    push = mockPush
    flush = mockFlush
    replayOffline = mockReplayOffline
  }
  return { EventBatcher: MockEventBatcher }
})

import { SignakitClient } from '../client'

const makeClient = (overrides: Record<string, unknown> = {}) =>
  new SignakitClient({
    apiKey: 'test_key',
    blockHostnames: [],
    blockBots: false,
    ...overrides,
  } as ConstructorParameters<typeof SignakitClient>[0])

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  sessionStorage.clear()
  // ensure screen dimensions look real so isHeadlessBrowser() returns false
  Object.defineProperty(window.screen, 'width', { value: 1920, configurable: true })
  Object.defineProperty(window.screen, 'height', { value: 1080, configurable: true })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('SignakitClient', () => {
  describe('init()', () => {
    it('returns early when hostname is blocked', () => {
      const client = new SignakitClient({
        apiKey: 'test_key',
        blockHostnames: ['localhost'],
        blockBots: false,
      })
      client.init()
      expect(mockStart).not.toHaveBeenCalled()
    })

    it('starts the batcher when hostname is not blocked', () => {
      const client = makeClient()
      client.init()
      expect(mockStart).toHaveBeenCalledOnce()
    })
  })

  describe('track()', () => {
    it('calls batcher.push with correct event_name and properties', () => {
      const client = makeClient()
      client.init()
      client.track('page_view', { foo: 'bar' })
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({ event_name: 'page_view', foo: 'bar' })
      )
    })
  })

  describe('page()', () => {
    it('dispatches event with event_name pageview', () => {
      const client = makeClient()
      client.init()
      client.page()
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({ event_name: 'pageview' })
      )
    })
  })

  describe('identify()', () => {
    it('dispatches event with event_name identify and user_id', () => {
      const client = makeClient()
      client.init()
      client.identify('usr_123', { plan: 'pro' })
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({ event_name: 'identify', user_id: 'usr_123' })
      )
    })

    it('subsequent track() calls include userTraits', () => {
      const client = makeClient()
      client.init()
      client.identify('usr_123', { plan: 'pro' })
      vi.clearAllMocks()
      client.track('some_event')
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({ plan: 'pro' })
      )
    })
  })

  describe('reset()', () => {
    it('clears userId — subsequent dispatch has user_id null', () => {
      const client = makeClient()
      client.init()
      client.identify('usr_123', { plan: 'pro' })
      client.reset()
      vi.clearAllMocks()
      client.track('after_reset')
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: null })
      )
    })
  })

  describe('disable() and enable()', () => {
    it('disable() prevents events from being dispatched', () => {
      const client = makeClient()
      client.init()
      mockPush.mockClear() // clear session_start fired during init
      client.disable()
      client.track('hidden_event')
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('enable() re-enables dispatch after disable()', () => {
      const client = makeClient()
      client.init()
      client.disable()
      client.enable()
      client.track('visible_event')
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({ event_name: 'visible_event' })
      )
    })
  })

  describe('consent', () => {
    it('dispatch does not push when consent.isEnabled is false', () => {
      const client = makeClient({ consent: 'opt-in' })
      client.init()
      client.track('blocked_event')
      expect(mockPush).not.toHaveBeenCalled()
    })
  })
})
