import { session as store } from '../utils/storage'
import { generateUUID } from '../utils/uuid'

const SESSION_KEY = 'sk_session_id'
const SESSION_LAST_ACTIVE_KEY = 'sk_session_last_active'
const SESSION_START_KEY = 'sk_session_start'
const SESSION_PAGEVIEWS_KEY = 'sk_session_pageviews'
const SESSION_TIMEOUT_MS = 30 * 60 * 1000

export interface SessionResult {
  id: string
  isNew: boolean
}

export function getOrCreateSession(): SessionResult {
  const id = store.get(SESSION_KEY)
  const lastActive = store.get(SESSION_LAST_ACTIVE_KEY)

  if (id && lastActive) {
    const elapsed = Date.now() - parseInt(lastActive, 10)
    if (elapsed < SESSION_TIMEOUT_MS) {
      touchSession()
      return { id, isNew: false }
    }
  }

  return { id: createSession(), isNew: true }
}

export function getSessionId(): string {
  return getOrCreateSession().id
}

export function touchSession(): void {
  store.set(SESSION_LAST_ACTIVE_KEY, String(Date.now()))
}

export function incrementPageviewCount(): void {
  const current = parseInt(store.get(SESSION_PAGEVIEWS_KEY) ?? '0', 10)
  store.set(SESSION_PAGEVIEWS_KEY, String(current + 1))
}

export interface SessionMeta {
  session_duration_ms: number
  pageview_count: number
}

export function getSessionMeta(): SessionMeta {
  const start = parseInt(store.get(SESSION_START_KEY) ?? String(Date.now()), 10)
  const pageview_count = parseInt(store.get(SESSION_PAGEVIEWS_KEY) ?? '0', 10)
  return {
    session_duration_ms: Date.now() - start,
    pageview_count,
  }
}

export function clearSession(): void {
  store.remove(SESSION_KEY)
  store.remove(SESSION_LAST_ACTIVE_KEY)
  store.remove(SESSION_START_KEY)
  store.remove(SESSION_PAGEVIEWS_KEY)
}

function createSession(): string {
  const id = generateUUID()
  const now = String(Date.now())
  store.set(SESSION_KEY, id)
  store.set(SESSION_LAST_ACTIVE_KEY, now)
  store.set(SESSION_START_KEY, now)
  store.set(SESSION_PAGEVIEWS_KEY, '0')
  return id
}
