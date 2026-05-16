import type { SignakitClient } from '../client'

let _client: SignakitClient | null = null
const startedForms = new WeakSet<HTMLFormElement>()
let _hasUnsubmittedStart = false

function getFormMeta(form: HTMLFormElement): Record<string, unknown> {
  return {
    form_id: form.id || null,
    form_name: form.getAttribute('name') || null,
  }
}

function onFocusIn(e: FocusEvent): void {
  const form = (e.target as Element).closest?.('form') as HTMLFormElement | null
  if (!form || startedForms.has(form)) return
  startedForms.add(form)
  _hasUnsubmittedStart = true
  _client?.dispatch({ event_name: 'form_start', ...getFormMeta(form) })
}

function onSubmit(e: Event): void {
  const form = e.target as HTMLFormElement
  _hasUnsubmittedStart = false
  _client?.dispatch({ event_name: 'form_submit', ...getFormMeta(form) })
}

function onVisibilityChange(): void {
  if (document.visibilityState === 'hidden' && _hasUnsubmittedStart) {
    _hasUnsubmittedStart = false
    _client?.dispatch({ event_name: 'form_abandon' })
  }
}

export function mount(client: SignakitClient): void {
  _client = client
  document.addEventListener('focusin', onFocusIn, { passive: true })
  document.addEventListener('submit', onSubmit, { passive: true })
  document.addEventListener('visibilitychange', onVisibilityChange)
}

export function unmount(): void {
  _client = null
  document.removeEventListener('focusin', onFocusIn)
  document.removeEventListener('submit', onSubmit)
  document.removeEventListener('visibilitychange', onVisibilityChange)
}
