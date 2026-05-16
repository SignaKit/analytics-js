import type { SignakitClient } from '../client'
import { findClosest } from '../utils/dom'

let _client: SignakitClient | null = null

function handleClick(e: MouseEvent): void {
  const anchor = findClosest(e.target, 'a[href]')
  if (!anchor) return

  let href: string
  try {
    href = (anchor as HTMLAnchorElement).href
    const url = new URL(href)
    if (url.origin === location.origin) return
    _client?.dispatch({
      event_name: 'outbound_click',
      event_type: 'outbound_click',
      destination_url: url.href,
      destination_domain: url.hostname,
    })
  } catch {
    // malformed href
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
