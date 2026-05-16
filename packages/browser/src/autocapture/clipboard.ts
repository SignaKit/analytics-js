import type { SignakitClient } from '../client'

let _client: SignakitClient | null = null

function onCopy(): void {
  _client?.dispatch({ event_name: 'clipboard_copy', event_type: 'copy' })
}

function onPaste(): void {
  _client?.dispatch({ event_name: 'clipboard_paste', event_type: 'paste' })
}

export function mount(client: SignakitClient): void {
  _client = client
  document.addEventListener('copy', onCopy)
  document.addEventListener('paste', onPaste)
}

export function unmount(): void {
  _client = null
  document.removeEventListener('copy', onCopy)
  document.removeEventListener('paste', onPaste)
}
