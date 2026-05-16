import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { RawEvent } from '@signakit/analytics-core'

vi.mock('../transport', () => ({
  sendBatch: vi.fn().mockResolvedValue(true),
}))

import { EventBatcher } from '../batcher'
import { sendBatch } from '../transport'

const makeEvent = (id = '1'): RawEvent =>
  ({ event_id: id, event_name: 'test' }) as unknown as RawEvent

const makeOptions = (overrides = {}) => ({
  endpoint: 'https://ingest.example.com/v1/analytics',
  batchSize: 2,
  flushInterval: 100,
  debug: false,
  ...overrides,
})

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('EventBatcher', () => {
  it('push() adds event to internal queue', () => {
    const batcher = new EventBatcher(makeOptions())
    batcher.push(makeEvent('1'))
    // Queue is internal, but we can verify flush sends 1 event
    const flushPromise = batcher.flush()
    vi.runAllTimers()
    return flushPromise.then(() => {
      expect(sendBatch).toHaveBeenCalledWith(
        [expect.objectContaining({ event_id: '1' })],
        makeOptions().endpoint,
        false
      )
    })
  })

  it('when batchSize is reached, flush is triggered automatically', async () => {
    const batcher = new EventBatcher(makeOptions({ batchSize: 2 }))
    batcher.push(makeEvent('1'))
    batcher.push(makeEvent('2')) // triggers auto-flush
    await vi.runAllTimersAsync()
    expect(sendBatch).toHaveBeenCalled()
  })

  it('flush() sends the batch and clears the queue', async () => {
    const batcher = new EventBatcher(makeOptions())
    batcher.push(makeEvent('1'))
    const flushPromise = batcher.flush()
    await vi.runAllTimersAsync()
    await flushPromise
    expect(sendBatch).toHaveBeenCalledTimes(1)
    // After flush, another flush should be a no-op
    vi.clearAllMocks()
    await batcher.flush()
    expect(sendBatch).not.toHaveBeenCalled()
  })

  it('flush() is a no-op when queue is empty', async () => {
    const batcher = new EventBatcher(makeOptions())
    await batcher.flush()
    expect(sendBatch).not.toHaveBeenCalled()
  })

  it('push() calls console.log when debug: true', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const batcher = new EventBatcher(makeOptions({ debug: true }))
    batcher.push(makeEvent('dbg'))
    expect(consoleSpy).toHaveBeenCalledWith('[SignaKit]', 'test', expect.objectContaining({ event_id: 'dbg' }))
    consoleSpy.mockRestore()
  })
})
