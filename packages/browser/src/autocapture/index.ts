import type { SignakitClient } from '../client'
import type { AutoCaptureConfig } from '@signakit/analytics-core'
import * as navigation from './navigation'
import * as interaction from './interaction'
import * as clipboard from './clipboard'
import * as scroll from './scroll'
import * as vitals from './vitals'
import * as outbound from './outbound'
import * as forms from './forms'

const defaults: Required<AutoCaptureConfig> = {
  interaction: true,
  navigation: true,
  clipboard: true,
  deadClicks: true,
  rageClicks: true,
  scrollDepth: true,
  webVitals: true,
  outboundClicks: true,
  formEvents: false,
}

export function mountAll(client: SignakitClient, config: AutoCaptureConfig = {}): void {
  const c = { ...defaults, ...config }
  if (c.navigation) navigation.mount(client)
  if (c.interaction) interaction.mount(client)
  if (c.clipboard) clipboard.mount(client)
  if (c.scrollDepth) scroll.mount(client)
  if (c.webVitals) void vitals.mount(client)
  if (c.outboundClicks) outbound.mount(client)
  if (c.formEvents) forms.mount(client)
}

export function unmountAll(): void {
  navigation.unmount()
  interaction.unmount()
  clipboard.unmount()
  scroll.unmount()
  vitals.unmount()
  outbound.unmount()
  forms.unmount()
}
