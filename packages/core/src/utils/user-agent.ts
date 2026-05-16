import type { DeviceType } from '../types/event'

const FACEBOOK = 'Facebook'
const MOBILE = 'Mobile'
const IOS = 'iOS'
const ANDROID = 'Android'
const TABLET = 'Tablet'
const ANDROID_TABLET = ANDROID + ' ' + TABLET
const IPAD = 'iPad'
const APPLE = 'Apple'
const SAFARI = 'Safari'
const BLACKBERRY = 'BlackBerry'
const SAMSUNG = 'Samsung'
const SAMSUNG_BROWSER = SAMSUNG + 'Browser'
const SAMSUNG_INTERNET = SAMSUNG + ' Internet'
const CHROME = 'Chrome'
const CHROME_OS = CHROME + ' OS'
const CHROME_IOS = CHROME + ' ' + IOS
const INTERNET_EXPLORER = 'Internet Explorer'
const INTERNET_EXPLORER_MOBILE = INTERNET_EXPLORER + ' ' + MOBILE
const OPERA = 'Opera'
const OPERA_MINI = OPERA + ' Mini'
const EDGE = 'Edge'
const MICROSOFT_EDGE = 'Microsoft ' + EDGE
const FIREFOX = 'Firefox'
const FIREFOX_IOS = FIREFOX + ' ' + IOS
const ANDROID_MOBILE = ANDROID + ' ' + MOBILE
const MOBILE_SAFARI = MOBILE + ' ' + SAFARI
const WINDOWS = 'Windows'
const WINDOWS_PHONE = WINDOWS + ' Phone'
const NOKIA = 'Nokia'
const GENERIC_MOBILE = 'Generic mobile'
const GENERIC_TABLET = 'Generic tablet'
const KONQUEROR = 'Konqueror'

const BLACKBERRY_REGEX = new RegExp(BLACKBERRY + '|PlayBook|BB10', 'i')

const windowsVersionMap: Record<string, string> = {
  'NT3.51': 'NT 3.11',
  'NT4.0': 'NT 4.0',
  '5.0': '2000',
  '5.1': 'XP',
  '5.2': 'XP',
  '6.0': 'Vista',
  '6.1': '7',
  '6.2': '8',
  '6.3': '8.1',
  '6.4': '10',
  '10.0': '10',
}

function isSafari(userAgent: string): boolean {
  return (
    userAgent.includes(SAFARI) && !userAgent.includes(CHROME) && !userAgent.includes(ANDROID)
  )
}

const safariCheck = (ua: string, vendor?: string): boolean =>
  (!!vendor && vendor.includes(APPLE)) || isSafari(ua)

export const detectBrowser = (userAgent: string, vendor: string | undefined): string => {
  vendor = vendor ?? ''

  if (userAgent.includes(' OPR/') && userAgent.includes('Mini')) {
    return OPERA_MINI
  } else if (userAgent.includes(' OPR/')) {
    return OPERA
  } else if (BLACKBERRY_REGEX.test(userAgent)) {
    return BLACKBERRY
  } else if (userAgent.includes('IE' + MOBILE) || userAgent.includes('WPDesktop')) {
    return INTERNET_EXPLORER_MOBILE
  } else if (userAgent.includes(SAMSUNG_BROWSER)) {
    return SAMSUNG_INTERNET
  } else if (userAgent.includes(EDGE) || userAgent.includes('Edg/')) {
    return MICROSOFT_EDGE
  } else if (userAgent.includes('FBIOS')) {
    return FACEBOOK + ' ' + MOBILE
  } else if (userAgent.includes('UCWEB') || userAgent.includes('UCBrowser')) {
    return 'UC Browser'
  } else if (userAgent.includes('CriOS')) {
    return CHROME_IOS
  } else if (userAgent.includes('CrMo')) {
    return CHROME
  } else if (userAgent.includes(CHROME)) {
    return CHROME
  } else if (userAgent.includes(ANDROID) && userAgent.includes(SAFARI)) {
    return ANDROID_MOBILE
  } else if (userAgent.includes('FxiOS')) {
    return FIREFOX_IOS
  } else if (userAgent.toLowerCase().includes(KONQUEROR.toLowerCase())) {
    return KONQUEROR
  } else if (safariCheck(userAgent, vendor)) {
    return userAgent.includes(MOBILE) ? MOBILE_SAFARI : SAFARI
  } else if (userAgent.includes(FIREFOX)) {
    return FIREFOX
  } else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
    return INTERNET_EXPLORER
  } else if (userAgent.includes('Gecko')) {
    return FIREFOX
  }

  return ''
}

const VERSION_SUFFIX = '(\\d+(\\.\\d+)?)'
const DEFAULT_VERSION_REGEX = new RegExp('Version/' + VERSION_SUFFIX)

const versionRegexes: Record<string, RegExp[]> = {
  [INTERNET_EXPLORER_MOBILE]: [new RegExp('rv:' + VERSION_SUFFIX)],
  [MICROSOFT_EDGE]: [new RegExp(EDGE + '?\\/' + VERSION_SUFFIX)],
  [CHROME]: [new RegExp('(' + CHROME + '|CrMo)\\/' + VERSION_SUFFIX)],
  [CHROME_IOS]: [new RegExp('CriOS\\/' + VERSION_SUFFIX)],
  'UC Browser': [new RegExp('(UCBrowser|UCWEB)\\/' + VERSION_SUFFIX)],
  [SAFARI]: [DEFAULT_VERSION_REGEX],
  [MOBILE_SAFARI]: [DEFAULT_VERSION_REGEX],
  [OPERA]: [new RegExp('(' + OPERA + '|OPR)\\/' + VERSION_SUFFIX)],
  [FIREFOX]: [new RegExp(FIREFOX + '\\/' + VERSION_SUFFIX)],
  [FIREFOX_IOS]: [new RegExp('FxiOS\\/' + VERSION_SUFFIX)],
  [KONQUEROR]: [new RegExp('Konqueror[:/]?' + VERSION_SUFFIX, 'i')],
  [BLACKBERRY]: [
    new RegExp(BLACKBERRY + ' ' + VERSION_SUFFIX),
    DEFAULT_VERSION_REGEX,
  ],
  [ANDROID_MOBILE]: [new RegExp('android\\s' + VERSION_SUFFIX, 'i')],
  [SAMSUNG_INTERNET]: [new RegExp(SAMSUNG_BROWSER + '\\/' + VERSION_SUFFIX)],
  [INTERNET_EXPLORER]: [new RegExp('(rv:|MSIE )' + VERSION_SUFFIX)],
  Mozilla: [new RegExp('rv:' + VERSION_SUFFIX)],
}

export const detectBrowserVersion = (
  userAgent: string,
  vendor: string | undefined
): number | null => {
  const browser = detectBrowser(userAgent, vendor)
  const regexes = versionRegexes[browser]
  if (regexes === undefined) return null

  for (const regex of regexes) {
    const matches = userAgent.match(regex)
    if (matches) {
      return parseFloat(matches[matches.length - 2] ?? '')
    }
  }
  return null
}

type OsResult = [string, string]
type OsMatcher = [RegExp, OsResult | ((match: RegExpMatchArray, ua: string) => OsResult)]

const osMatchers: OsMatcher[] = [
  [BLACKBERRY_REGEX, [BLACKBERRY, '']],
  [
    new RegExp(WINDOWS, 'i'),
    (_, ua) => {
      if (/Phone/.test(ua) || /WPDesktop/.test(ua)) return [WINDOWS_PHONE, '']
      if (new RegExp(MOBILE).test(ua) && !/IEMobile\b/.test(ua)) {
        return [WINDOWS + ' ' + MOBILE, '']
      }
      const match = /Windows NT ([0-9.]+)/i.exec(ua)
      if (match?.[1]) {
        const version = match[1]
        let osVersion = windowsVersionMap[version] ?? ''
        if (/arm/i.test(ua)) osVersion = 'RT'
        return [WINDOWS, osVersion]
      }
      return [WINDOWS, '']
    },
  ],
  [
    /((iPhone|iPad|iPod).*?OS (\d+)_(\d+)_?(\d+)?|iPhone)/,
    (match) => {
      if (match[3]) {
        return [IOS, [match[3], match[4], match[5] ?? '0'].join('.')]
      }
      return [IOS, '']
    },
  ],
  [
    /(watch.*\/(\d+\.\d+\.\d+)|watch os,(\d+\.\d+),)/i,
    (match) => {
      const version = match[2] !== undefined ? match[2] : (match[3] ?? '')
      return ['watchOS', version]
    },
  ],
  [
    new RegExp('(' + ANDROID + ' (\\d+)\\.(\\d+)\\.?(\\d+)?|' + ANDROID + ')', 'i'),
    (match) => {
      if (match[2]) {
        return [ANDROID, [match[2], match[3], match[4] ?? '0'].join('.')]
      }
      return [ANDROID, '']
    },
  ],
  [
    /Mac OS X (\d+)[_.](\d+)[_.]?(\d+)?/i,
    (match): OsResult => {
      if (match[1]) {
        return ['Mac OS X', [match[1], match[2], match[3] ?? '0'].join('.')]
      }
      return ['Mac OS X', '']
    },
  ],
  [/Mac/i, ['Mac OS X', '']],
  [/CrOS/, [CHROME_OS, '']],
  [/Linux|debian/i, ['Linux', '']],
]

export const detectOS = (userAgent: string): OsResult => {
  for (const [regex, resultOrFn] of osMatchers) {
    const match = regex.exec(userAgent)
    if (match) {
      const result =
        typeof resultOrFn === 'function' ? resultOrFn(match, userAgent) : resultOrFn
      return result
    }
  }
  return ['', '']
}

const detectDevice = (userAgent: string): string => {
  if (new RegExp('(' + WINDOWS_PHONE + '|WPDesktop)', 'i').test(userAgent)) {
    return WINDOWS_PHONE
  } else if (/iPad/.test(userAgent)) {
    return IPAD
  } else if (/iPod/.test(userAgent)) {
    return 'iPod Touch'
  } else if (/iPhone/.test(userAgent)) {
    return 'iPhone'
  } else if (BLACKBERRY_REGEX.test(userAgent)) {
    return BLACKBERRY
  } else if (/(kobo)\s(ereader|touch)/i.test(userAgent)) {
    return 'Kobo'
  } else if (new RegExp(NOKIA, 'i').test(userAgent)) {
    return NOKIA
  } else if (
    /(kf[a-z]{2}wi|aeo[c-r]{2})( bui|\))/i.test(userAgent) ||
    /(kf[a-z]+)( bui|\)).+silk\//i.test(userAgent)
  ) {
    return 'Kindle Fire'
  } else if (/(Android|ZTE)/i.test(userAgent)) {
    if (
      !new RegExp(MOBILE).test(userAgent) ||
      /(9138B|TB782B|Nexus [97]|pixel c|HUAWEISHT|BTV|noble nook|smart ultra 6)/i.test(userAgent)
    ) {
      if (
        (/pixel[\daxl ]{1,6}/i.test(userAgent) && !/pixel c/i.test(userAgent)) ||
        /(huaweimed-al00|tah-|APA|SM-G92|i980|zte|U304AA)/i.test(userAgent) ||
        (/lmy47v/i.test(userAgent) && !/QTAQZ3/i.test(userAgent))
      ) {
        return ANDROID
      }
      return ANDROID_TABLET
    }
    return ANDROID
  } else if (new RegExp('(pda|' + MOBILE + ')', 'i').test(userAgent)) {
    return GENERIC_MOBILE
  } else if (
    new RegExp(TABLET, 'i').test(userAgent) &&
    !new RegExp(TABLET + ' pc', 'i').test(userAgent)
  ) {
    return GENERIC_TABLET
  }

  return ''
}

export interface DeviceTypeOptions {
  userAgentDataPlatform?: string
  maxTouchPoints?: number
  screenWidth?: number
  screenHeight?: number
  devicePixelRatio?: number
}

export const detectDeviceType = (
  userAgent: string,
  options?: DeviceTypeOptions
): DeviceType => {
  const device = detectDevice(userAgent)

  if (
    device === IPAD ||
    device === ANDROID_TABLET ||
    device === 'Kobo' ||
    device === 'Kindle Fire' ||
    device === GENERIC_TABLET
  ) {
    return 'tablet'
  } else if (device) {
    return 'mobile'
  }

  // Chrome on Android tablets may report a desktop UA — use Client Hints as a fallback
  if (options?.userAgentDataPlatform === 'Android' && (options?.maxTouchPoints ?? 0) > 0) {
    const shortSide = Math.min(options?.screenWidth ?? 0, options?.screenHeight ?? 0)
    const shortSideDp = shortSide / (options?.devicePixelRatio ?? 1)
    return shortSideDp >= 600 ? 'tablet' : 'mobile'
  }

  return 'desktop'
}
