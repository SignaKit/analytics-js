import type { RawEvent } from '@signakit/analytics-core'
import { local } from '../utils/storage'

const QUEUE_KEY = 'sk_queue'
const MAX_QUEUE_SIZE = 500

export class OfflineQueue {
  drain(): RawEvent[] {
    const raw = local.get(QUEUE_KEY)
    if (!raw) return []
    try {
      const events = JSON.parse(raw) as RawEvent[]
      local.remove(QUEUE_KEY)
      return events
    } catch {
      local.remove(QUEUE_KEY)
      return []
    }
  }

  push(events: RawEvent[]): void {
    const existing = this.drain()
    const merged = [...existing, ...events]
    const capped = merged.length > MAX_QUEUE_SIZE ? merged.slice(-MAX_QUEUE_SIZE) : merged
    local.set(QUEUE_KEY, JSON.stringify(capped))
  }
}
