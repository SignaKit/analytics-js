import type { SignakitClient } from '../client'

let _client: SignakitClient | null = null
const fired = new Set<number>()
const MILESTONES = [25, 50, 75, 100]
let _startTime = 0

function getScrollPercent(): number {
  const el = document.documentElement
  const scrolled = el.scrollTop
  const total = el.scrollHeight - el.clientHeight
  if (total <= 0) return 100
  return Math.round((scrolled / total) * 100)
}

function checkMilestones(): void {
  const pct = getScrollPercent()
  for (const milestone of MILESTONES) {
    if (pct >= milestone && !fired.has(milestone)) {
      fired.add(milestone)
      const engagement_time_ms = Date.now() - _startTime
      _client?.dispatch({
        event_name: 'scroll_depth',
        event_type: 'scroll_depth',
        depth_percent: milestone,
        engagement_time_ms,
      })
    }
  }
}

function onScroll(): void {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(checkMilestones)
  } else {
    checkMilestones()
  }
}

export function mount(client: SignakitClient): void {
  _client = client
  _startTime = Date.now()
  fired.clear()
  window.addEventListener('scroll', onScroll, { passive: true })
  checkMilestones()
}

export function unmount(): void {
  _client = null
  window.removeEventListener('scroll', onScroll)
}
