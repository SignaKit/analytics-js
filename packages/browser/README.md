# @signakit/analytics-js

Privacy-first, cookieless browser analytics SDK. Tracks page views, user interactions, and custom events — no cookies required.

## Installation

```bash
npm install @signakit/analytics-js
# or
pnpm add @signakit/analytics-js
# or
yarn add @signakit/analytics-js
```

## CDN / Script Tag

Add the snippet to your `<head>` for a no-build setup:

```html
<script
  src="https://cdn.signakit.com/analytics.min.js"
  data-api-key="ska_yourkey"
  defer
></script>
```

The script self-initializes using the `data-api-key` attribute and exposes `window.signakitAnalytics`.

---

## Quick Start

```ts
import signakitAnalytics from '@signakit/analytics-js'

signakitAnalytics.init('ska_yourkey')
```

That's it. Page views are tracked automatically on init.

---

## API

### `init(apiKey, options?)`

Initializes the SDK. Must be called before any other method.

```ts
signakitAnalytics.init('ska_yourkey', {
  consent: 'opt-in',        // wait for user consent before tracking
  sampleRate: 0.5,          // only track 50% of sessions
  debug: true,              // log events to the console
})
```

### `page(properties?)`

Manually track a page view. Autocapture handles this automatically for most setups — call this only if you've disabled navigation autocapture.

```ts
signakitAnalytics.page({ section: 'docs' })
```

### `track(event, properties?)`

Track a custom event.

```ts
signakitAnalytics.track('signup_completed', {
  plan: 'pro',
  trial: true,
})
```

### `identify(userId, traits?)`

Associate the current session with a known user. Traits are attached to all subsequent events.

```ts
signakitAnalytics.identify('user_abc123', {
  plan: 'pro',
  email: 'user@example.com',
})
```

### `reset()`

Clear the current user identity and start a fresh anonymous session. Call on sign-out.

```ts
signakitAnalytics.reset()
```

### `flush()`

Force-send any queued events immediately. Useful before navigation or sign-out.

```ts
await signakitAnalytics.flush()
```

### `getAnonymousId()` / `getSessionId()`

Read the current anonymous ID or session ID.

```ts
const anonId = signakitAnalytics.getAnonymousId()
const sessionId = signakitAnalytics.getSessionId()
```

### `destroy()`

Tear down the SDK — removes event listeners, flushes the queue, and sends a `session_end` event. Useful in SPA unmount or test teardown.

```ts
signakitAnalytics.destroy()
```

---

## Consent Management

Set `consent` in `init()` to control when tracking starts.

| Mode | Behavior |
|---|---|
| `'none'` (default) | Tracking starts immediately |
| `'opt-out'` | Tracking starts immediately; users can opt out |
| `'opt-in'` | Tracking is paused until the user explicitly opts in |

```ts
signakitAnalytics.init('ska_yourkey', { consent: 'opt-in' })

// After the user accepts your cookie banner:
signakitAnalytics.optIn()

// If the user declines:
signakitAnalytics.optOut()
```

`enable()` / `disable()` toggle tracking without persisting the preference. `optIn()` / `optOut()` persist to `localStorage`.

---

## Autocapture

Autocapture is on by default. Disable specific features as needed:

```ts
signakitAnalytics.init('ska_yourkey', {
  autoCapture: {
    navigation: true,       // page views on route change (default: true)
    interaction: true,      // clicks (default: true)
    rageClicks: true,       // rapid repeated clicks (default: true)
    deadClicks: true,       // clicks with no DOM/navigation response (default: true)
    scrollDepth: true,      // 25/50/75/100% scroll milestones (default: true)
    outboundClicks: true,   // clicks on external links (default: true)
    clipboard: false,       // copy/paste events (default: false)
    formEvents: false,      // form_start / form_abandon / form_submit (default: false)
    webVitals: false,       // LCP, CLS, INP via web-vitals (default: false)
  },
})
```

To disable all autocapture:

```ts
signakitAnalytics.init('ska_yourkey', {
  autoCapture: {},
})
```

### Web Vitals

Web Vitals tracking requires the optional peer dependency:

```bash
npm install web-vitals
```

Then enable it in your config:

```ts
signakitAnalytics.init('ska_yourkey', {
  autoCapture: { webVitals: true },
})
```

---

## All Options

| Option | Type | Default | Description |
|---|---|---|---|
| `consent` | `'none' \| 'opt-out' \| 'opt-in'` | `'none'` | Consent mode |
| `autoCapture` | `AutoCaptureConfig` | All features on | Autocapture feature flags |
| `cookieless` | `boolean` | `true` | Use `localStorage` instead of cookies |
| `blockHostnames` | `string[]` | `['localhost', '127.0.0.1']` | Hostnames where tracking is suppressed |
| `blockBots` | `boolean` | `true` | Suppress events from detected bots |
| `sampleRate` | `number` | `1` | Fraction of sessions to track (0–1) |
| `batchSize` | `number` | `20` | Events per batch before flushing |
| `flushInterval` | `number` | `5000` | Milliseconds between automatic flushes |
| `endpoint` | `string` | SignaKit ingest URL | Override the ingest endpoint |
| `debug` | `boolean` | `false` | Log events and errors to the console |

---

## License

MIT
