# SignaKit Analytics JS

Privacy-first, cookieless analytics SDKs for JavaScript. Tracks page views, user interactions, and custom events with no cookies and a minimal footprint.

## Packages

| Package | Version | Description |
|---|---|---|
| [`@signakit/analytics-js`](./packages/browser) | [![npm](https://img.shields.io/npm/v/@signakit/analytics-js)](https://www.npmjs.com/package/@signakit/analytics-js) | Browser SDK |
| [`@signakit/analytics-core`](./packages/core) | [![npm](https://img.shields.io/npm/v/@signakit/analytics-core)](https://www.npmjs.com/package/@signakit/analytics-core) | Shared types and utilities |

## Quick Start

```bash
npm install @signakit/analytics-js
```

```ts
import signakitAnalytics from '@signakit/analytics-js'

signakitAnalytics.init('ska_yourkey')
```

Or via CDN:

```html
<script
  src="https://cdn.signakit.com/analytics.min.js"
  data-api-key="ska_yourkey"
  defer
></script>
```

Full API reference and configuration options are in the [browser SDK README](./packages/browser/README.md).

## Features

- **Cookieless** — uses `localStorage` for anonymous ID and session tracking, no cookies set
- **Privacy-first** — IP anonymization handled server-side; bot traffic filtered automatically
- **Autocapture** — page views, clicks, scroll depth, rage clicks, dead clicks, outbound links, web vitals, and form events out of the box
- **Consent-aware** — built-in `opt-in` / `opt-out` consent modes with persistent preference storage
- **Lightweight** — browser SDK is under 8 KB gzip
- **Resilient** — offline queue replays missed events on reconnect; `sendBeacon` ensures delivery on page close

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup instructions, test conventions, and how to submit a pull request.

## License

MIT — see [LICENSE](./LICENSE) for details.
