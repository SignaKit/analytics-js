export type {
  RawEvent,
  PartialRawEvent,
  DeviceType,
  MetricName,
  MetricRating,
  BotConfidence,
  ConsentMode,
  AutoCaptureConfig,
  SignakitAnalyticsConfig,
  SignakitAnalyticsInstance,
} from './types/index'

export { BLOCKED_UA_STRINGS, isBlockedUserAgent } from './utils/bot-detection'
export {
  detectBrowser,
  detectBrowserVersion,
  detectOS,
  detectDeviceType,
} from './utils/user-agent'
export type { DeviceTypeOptions } from './utils/user-agent'
