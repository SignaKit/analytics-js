import type { SignakitClient } from '../client'

let _client: SignakitClient | null = null
let _patched = false

function handlePageLeave(useBeacon: boolean): void {
  _client?.page({ event_name: 'pageleave' })
  _client?.flushBeacon(useBeacon)
}

function handlePageView(): void {
  _client?.page()
}

function patchHistory(): void {
  if (_patched) return
  _patched = true

  const original = {
    pushState: history.pushState.bind(history),
    replaceState: history.replaceState.bind(history),
  }

  history.pushState = function (...args) {
    original.pushState(...args)
    handlePageView()
  }

  history.replaceState = function (...args) {
    original.replaceState(...args)
    handlePageView()
  }

  window.addEventListener('popstate', handlePageView)
}

export function mount(client: SignakitClient): void {
  _client = client
  patchHistory()

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') handlePageLeave(false)
  })

  window.addEventListener('pagehide', () => handlePageLeave(true))

  handlePageView()
}

export function unmount(): void {
  _client = null
}
