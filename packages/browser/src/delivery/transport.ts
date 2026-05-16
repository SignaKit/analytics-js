import type { RawEvent } from '@signakit/analytics-core'

const RETRY_DELAYS = [1000, 2000, 4000]

export async function sendBatch(
  events: RawEvent[],
  endpoint: string,
  apiKey: string,
  useBeacon = false
): Promise<boolean> {
  const body = JSON.stringify({ events })

  if (useBeacon && typeof navigator.sendBeacon === 'function') {
    return navigator.sendBeacon(endpoint, new Blob([body], { type: 'application/json' }))
  }

  for (let attempt = 0; attempt < RETRY_DELAYS.length; attempt++) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body,
        keepalive: true,
      })
      if (res.ok) return true
      if (res.status < 500) return false
    } catch {
      // network error — retry
    }

    if (attempt < RETRY_DELAYS.length - 1) {
      await delay(RETRY_DELAYS[attempt] ?? 1000)
    }
  }

  return false
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
