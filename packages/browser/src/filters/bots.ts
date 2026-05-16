import { isBlockedUserAgent } from '@signakit/analytics-core'

export { isBlockedUserAgent }

export function isHeadlessBrowser(): boolean {
  return navigator.webdriver === true || screen.width === 0 || screen.height === 0
}

export function isBotSession(): boolean {
  return isBlockedUserAgent(navigator.userAgent) || isHeadlessBrowser()
}
