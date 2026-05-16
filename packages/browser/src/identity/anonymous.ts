import { local } from '../utils/storage'
import { generateUUID } from '../utils/uuid'

const KEY = 'sk_anon_id'

export function getAnonymousId(): string {
  const existing = local.get(KEY)
  if (existing) return existing
  const id = generateUUID()
  local.set(KEY, id)
  return id
}

export function clearAnonymousId(): void {
  local.remove(KEY)
}
