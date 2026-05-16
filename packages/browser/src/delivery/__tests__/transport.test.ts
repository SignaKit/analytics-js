import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { sendBatch } from '../transport'
import type { RawEvent } from '@signakit/analytics-core'

const ENDPOINT = 'https://ingest.example.com/v1/analytics'
const EVENTS = [{ event_id: '1', event_name: 'test' }] as unknown as RawEvent[]

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('sendBatch', () => {
  it('calls fetch with POST method, correct endpoint, and JSON body', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    vi.stubGlobal('fetch', mockFetch)

    const promise = sendBatch(EVENTS, ENDPOINT)
    await vi.runAllTimersAsync()
    await promise

    expect(mockFetch).toHaveBeenCalledWith(
      ENDPOINT,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: EVENTS }),
      })
    )
  })

  it('returns true on 200 response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }))
    const promise = sendBatch(EVENTS, ENDPOINT)
    await vi.runAllTimersAsync()
    expect(await promise).toBe(true)
  })

  it('returns false on 400 response (no retry)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 400 })
    vi.stubGlobal('fetch', mockFetch)
    const promise = sendBatch(EVENTS, ENDPOINT)
    await vi.runAllTimersAsync()
    expect(await promise).toBe(false)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('retries on 500 response — fetch called 3 times, returns false', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 500 })
    vi.stubGlobal('fetch', mockFetch)
    const promise = sendBatch(EVENTS, ENDPOINT)
    await vi.runAllTimersAsync()
    expect(await promise).toBe(false)
    expect(mockFetch).toHaveBeenCalledTimes(3)
  })

  it('uses sendBeacon when useBeacon=true and returns its result', async () => {
    const mockBeacon = vi.fn().mockReturnValue(true)
    vi.stubGlobal('navigator', { ...navigator, sendBeacon: mockBeacon })
    const result = await sendBatch(EVENTS, ENDPOINT, true)
    expect(mockBeacon).toHaveBeenCalledOnce()
    expect(result).toBe(true)
  })

  it('returns false when sendBeacon is unavailable and all fetch retries fail', async () => {
    vi.stubGlobal('navigator', { ...navigator, sendBeacon: undefined })
    const mockFetch = vi.fn().mockRejectedValue(new Error('network error'))
    vi.stubGlobal('fetch', mockFetch)
    const promise = sendBatch(EVENTS, ENDPOINT, true)
    await vi.runAllTimersAsync()
    expect(await promise).toBe(false)
    expect(mockFetch).toHaveBeenCalledTimes(3)
  })
})
