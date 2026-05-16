import { describe, it, expect, beforeEach } from 'vitest'
import { OfflineQueue } from '../offline'
import type { RawEvent } from '@signakit/analytics-core'

beforeEach(() => {
  localStorage.clear()
})

const makeEvent = (id: string): RawEvent =>
  ({ event_id: id, event_name: 'test' }) as unknown as RawEvent

describe('OfflineQueue', () => {
  it('drain() returns [] when nothing is stored', () => {
    const q = new OfflineQueue()
    expect(q.drain()).toEqual([])
  })

  it('push then drain returns the event', () => {
    const q = new OfflineQueue()
    const event = makeEvent('1')
    q.push([event])
    expect(q.drain()).toEqual([event])
  })

  it('drain() clears the queue — subsequent drain returns []', () => {
    const q = new OfflineQueue()
    q.push([makeEvent('1')])
    q.drain()
    expect(q.drain()).toEqual([])
  })

  it('respects 500-event cap — push 600, drain returns 500', () => {
    const q = new OfflineQueue()
    const events = Array.from({ length: 600 }, (_, i) => makeEvent(String(i)))
    q.push(events)
    const drained = q.drain()
    expect(drained.length).toBe(500)
  })

  it('handles malformed JSON in localStorage gracefully', () => {
    localStorage.setItem('sk_queue', 'invalid')
    const q = new OfflineQueue()
    expect(q.drain()).toEqual([])
  })
})
