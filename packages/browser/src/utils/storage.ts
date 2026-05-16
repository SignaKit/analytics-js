function safeGet(store: Storage, key: string): string | null {
  try {
    return store.getItem(key)
  } catch {
    return null
  }
}

function safeSet(store: Storage, key: string, value: string): void {
  try {
    store.setItem(key, value)
  } catch {
    // storage full or blocked (incognito)
  }
}

function safeRemove(store: Storage, key: string): void {
  try {
    store.removeItem(key)
  } catch {
    // noop
  }
}

export const local = {
  get: (key: string) => safeGet(localStorage, key),
  set: (key: string, value: string) => safeSet(localStorage, key, value),
  remove: (key: string) => safeRemove(localStorage, key),
}

export const session = {
  get: (key: string) => safeGet(sessionStorage, key),
  set: (key: string, value: string) => safeSet(sessionStorage, key, value),
  remove: (key: string) => safeRemove(sessionStorage, key),
}
