import type { SignakitClient } from '../client'

export async function mount(client: SignakitClient): Promise<void> {
  try {
    const { onLCP, onFCP, onCLS, onINP, onTTFB } = await import('web-vitals')

    const report = (name: string) => (metric: { value: number; rating: string }) => {
      client.dispatch({
        event_name: 'web_vitals',
        metric_name: name,
        metric_value: metric.value,
        metric_rating: metric.rating,
      })
    }

    onLCP(report('LCP'))
    onFCP(report('FCP'))
    onCLS(report('CLS'))
    onINP(report('INP'))
    onTTFB(report('TTFB'))
  } catch {
    // web-vitals not installed — skip silently
  }
}

export function unmount(): void {
  // web-vitals has no cleanup API
}
