export const BLOCKED_UA_STRINGS = [
  // Generic crawlers & spiders
  'bot.htm',
  'bot.php',
  '(bot;',
  'bot/',
  'crawler',
  'spider',

  // Search engines
  'amazonbot',
  'amazonproductbot',
  'applebot',
  'archive.org_bot',
  'baiduspider',
  'bingbot',
  'bingpreview',
  'duckduckbot',
  'googlebot',
  'googleother',
  'google-cloudvertexbot',
  'google-hoteladsverifier',
  'google-inspectiontool',
  'google-read-aloud',
  'google favicon',
  'google web preview',
  'googleweblight',
  'adsbot-google',
  'apis-google',
  'duplexweb-google',
  'feedfetcher-google',
  'mediapartners-google',
  'storebot-google',
  'http://yandex.com/bots',
  'yandexbot',
  'msnbot',
  'slurp',
  'yahoo! slurp',

  // Social & content scrapers
  'awariobot',
  'facebookexternal',
  'facebookcatalog',
  'hubspot',
  'ia_archiver',
  'leikibot',
  'linkedinbot',
  'meta-externalagent',
  'pinterest',
  'slackbot',
  'twitterbot',

  // SEO tools
  'ahrefsbot',
  'ahrefssiteaudit',
  'backlinksextendedbot',
  'dataforseobot',
  'deepscan',
  'mj12bot',
  'petalbot',
  'rogerbot',
  'screaming frog',
  'sebot-wa',
  'semrushbot',
  'sitebulb',
  'siteauditbot',
  'splitsignalbot',
  'trendictionbot',
  'zoombot',

  // Security & audit tools
  'nessus',
  'turnitin',

  // AI crawlers
  'gptbot',
  'oai-searchbot',
  'chatgpt-user',
  'claudebot',
  'perplexitybot',
  'bytespider',

  // Prerender & screenshot
  'prerender',
  'vercel-screenshot',
  'vercelbot',
  'chrome-lighthouse',
  'app.hypefactors.com',

  // Uptime monitors
  'better uptime bot',
  'sentryuptimebot',
  'uptimerobot',

  // Headless browsers
  'headlesschrome',
  'cypress',
]

export const isBlockedUserAgent = (ua: string | undefined, extraBlocklist: string[] = []): boolean => {
  if (!ua) return false
  const uaLower = ua.toLowerCase()
  return BLOCKED_UA_STRINGS.concat(extraBlocklist).some((blocked) =>
    uaLower.includes(blocked.toLowerCase())
  )
}
