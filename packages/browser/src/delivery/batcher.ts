import type { RawEvent } from '@signakit/analytics-core'
import { sendBatch } from './transport'
import { OfflineQueue } from './offline'

interface BatcherOptions {
  endpoint: string
  apiKey: string
  batchSize: number
  flushInterval: number
  debug: boolean
}

export class EventBatcher {
  private queue: RawEvent[] = []
  private timer: ReturnType<typeof setInterval> | null = null
  private readonly offline = new OfflineQueue()

  constructor(private options: BatcherOptions) {}

  start(): void {
    this.timer = setInterval(() => this.flush(), this.options.flushInterval)
  }

  stop(): void {
    if (this.timer !== null) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  push(event: RawEvent): void {
    this.queue.push(event)
    if (this.options.debug) {
      console.log('[SignaKit]', event.event_name, event)
    }
    if (this.queue.length >= this.options.batchSize) {
      void this.flush()
    }
  }

  async flush(useBeacon = false): Promise<void> {
    if (this.queue.length === 0) return
    const batch = this.queue.splice(0)
    const success = await sendBatch(batch, this.options.endpoint, this.options.apiKey, useBeacon)
    if (!success) {
      this.offline.push(batch)
    }
  }

  async replayOffline(): Promise<void> {
    const queued = this.offline.drain()
    if (queued.length === 0) return
    const success = await sendBatch(queued, this.options.endpoint, this.options.apiKey)
    if (!success) {
      this.offline.push(queued)
    }
  }
}
