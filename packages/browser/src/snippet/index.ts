import signakitAnalytics from '../index'

declare global {
  interface Window {
    signakitAnalytics: typeof signakitAnalytics
  }
}

window.signakitAnalytics = signakitAnalytics

function bootstrap(): void {
  const script = document.currentScript as HTMLScriptElement | null
  const apiKey = script?.getAttribute('data-api-key') ?? ''
  if (!apiKey) {
    console.warn('[SignaKit] No data-api-key attribute found on <script> tag')
    return
  }
  signakitAnalytics.init(apiKey)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap)
} else {
  bootstrap()
}
