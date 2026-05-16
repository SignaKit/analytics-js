import type { SignakitClient } from '../client'
import { getElementMetadata, findClosest } from '../utils/dom'

let _client: SignakitClient | null = null

interface ClickRecord {
  x: number
  y: number
  time: number
}

const recentClicks: ClickRecord[] = []
const RAGE_WINDOW_MS = 700
const RAGE_MIN_CLICKS = 3
const RAGE_RADIUS_PX = 20
const DEAD_CLICK_TIMEOUT_MS = 750

function distance(a: ClickRecord, b: ClickRecord): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function isRageClick(latest: ClickRecord): boolean {
  const window = recentClicks.filter(
    (c) => latest.time - c.time <= RAGE_WINDOW_MS && distance(c, latest) <= RAGE_RADIUS_PX
  )
  return window.length >= RAGE_MIN_CLICKS
}

function handleClick(e: MouseEvent): void {
  const target = e.target
  if (!(target instanceof Element)) return
  if (findClosest(target, '[data-sk-ignore]')) return

  const meta = getElementMetadata(target)
  const skEvent = target.getAttribute('data-sk-event')
  const now = Date.now()
  const record: ClickRecord = { x: e.clientX, y: e.clientY, time: now }

  recentClicks.push(record)
  if (recentClicks.length > 10) recentClicks.shift()

  if (isRageClick(record)) {
    _client?.dispatch({
      event_name: 'rage_click',
      event_type: 'rage_click',
      click_count: recentClicks.filter(
        (c) => now - c.time <= RAGE_WINDOW_MS && distance(c, record) <= RAGE_RADIUS_PX
      ).length,
      ...meta,
    })
    return
  }

  // Dead click detection
  let mutated = false
  let navigated = false
  const startUrl = location.href
  const observer = new MutationObserver(() => {
    mutated = true
    observer.disconnect()
  })
  observer.observe(document.body, { childList: true, subtree: true, attributes: true })

  setTimeout(() => {
    observer.disconnect()
    navigated = location.href !== startUrl
    if (!mutated && !navigated) {
      _client?.dispatch({ event_name: 'dead_click', event_type: 'dead_click', ...meta })
    }
  }, DEAD_CLICK_TIMEOUT_MS)

  if (skEvent) {
    _client?.dispatch({ event_name: skEvent, event_type: 'click', ...meta })
  } else {
    _client?.dispatch({ event_name: 'click', event_type: 'click', ...meta })
  }
}

export function mount(client: SignakitClient): void {
  _client = client
  document.addEventListener('click', handleClick, { passive: true })
}

export function unmount(): void {
  _client = null
  document.removeEventListener('click', handleClick)
}
