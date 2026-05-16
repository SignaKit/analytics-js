# Contributing to SignaKit Analytics JS

Thanks for your interest in contributing! This guide covers everything you need to work on the SDK packages in this monorepo.

## Table of Contents

- [Repository layout](#repository-layout)
- [Before you start](#before-you-start)
- [Setup](#setup)
- [Development workflow](#development-workflow)
  - [Running tests](#running-tests)
  - [Watching tests during development](#watching-tests-during-development)
  - [Type checking](#type-checking)
  - [Building](#building)
- [Test conventions](#test-conventions)
  - [File layout](#file-layout)
  - [What to test](#what-to-test)
  - [Updating tests when the SDK changes](#updating-tests-when-the-sdk-changes)
- [Submitting a pull request](#submitting-a-pull-request)
- [Adding a new package](#adding-a-new-package)
- [Releases](#releases)
- [License](#license)

---

## Repository layout

```
analytics-js/
├── packages/
│   ├── core/      # @signakit/analytics-core — shared types, utilities
│   ├── browser/   # @signakit/analytics-js   — browser SDK
│   └── node/      # @signakit/analytics-node — Node.js SDK (in development)
├── turbo.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

`@signakit/analytics-core` is a types-only package depended on by both `browser` and `node`. It must build before the other packages — Turborepo handles this automatically.

---

## Before you start

- **Node.js 22+** is required (see `.nvmrc`).
- **pnpm** is the package manager for this repo. Install it with `npm install -g pnpm` if you don't have it.
- Fork the repository and create your branch from `main`.
- Keep your changes focused — one bug fix or feature per PR makes review much faster.
- Search [existing issues](https://github.com/SignaKit/analytics-js/issues) before opening a new one.

---

## Setup

Install all dependencies from the repo root:

```bash
pnpm install
```

This links all workspace packages together so changes to `@signakit/analytics-core` are immediately reflected in `browser` and `node` without a rebuild.

---

## Development workflow

All scripts can be run from the repo root via Turborepo, or from inside an individual package directory using `pnpm` directly.

### Running tests

```bash
# All packages
pnpm turbo test

# Single package
cd packages/browser
pnpm test
```

### Watching tests during development

```bash
cd packages/browser
pnpm test:watch
```

Re-runs only the affected tests on every file save.

### Type checking

```bash
# All packages
pnpm turbo type-check

# Single package
cd packages/browser
pnpm type-check
```

### Building

```bash
# All packages (respects dependency order: core → browser/node)
pnpm turbo build

# Single package
cd packages/browser
pnpm build
```

Output lands in each package's `dist/` directory. The browser package produces:
- `dist/index.mjs` / `dist/index.cjs` — npm build (ESM + CJS)
- `dist/analytics.min.js` — CDN snippet (IIFE, minified)

---

## Test conventions

### File layout

Tests live alongside source under `src/`:

```
packages/browser/src/
├── client.ts
├── context.ts
├── __tests__/
│   ├── client.test.ts
│   └── context.test.ts
├── identity/
│   ├── session.ts
│   └── __tests__/
│       └── session.test.ts
├── delivery/
│   ├── batcher.ts
│   └── __tests__/
│       └── batcher.test.ts
└── filters/
    ├── consent.ts
    └── __tests__/
        └── consent.test.ts
```

Each test file corresponds to the source file it tests.

### What to test

**Unit tests** test one module in isolation with all external dependencies mocked:
- Happy paths — the normal, successful flow
- Error paths — invalid input, storage unavailable, network failures
- Edge cases — empty values, boundary conditions, missing optional fields

**Never** call real external APIs or write to real storage in tests. Use `vi.mock`, `vi.spyOn`, or `Object.defineProperty` to control browser APIs.

### Updating tests when the SDK changes

| Type of change | What to update |
|---|---|
| New public method on `SignakitClient` | Add a `describe` block in `client.test.ts` |
| New autocapture module | Add a corresponding `__tests__/` file in `autocapture/` |
| New field on `RawEvent` | Update the relevant context or identity tests |
| New config option | Add a test case covering the default and an explicit override |
| Change to batch/transport behaviour | Update `batcher.test.ts` and `transport.test.ts` |
| Breaking change to the public API | Update `client.test.ts` and the README |

If a test is removed because the behaviour was intentionally deleted, note it in the PR description.

---

## Submitting a pull request

1. **Run the full check locally** before pushing:
   ```bash
   pnpm turbo type-check && pnpm turbo test && pnpm turbo build
   ```
2. Make sure all tests pass. Do not open a PR with failing tests.
3. If your change affects the public API or observable behaviour, update the relevant test file(s) and the `packages/browser/README.md`.
4. Keep the PR description focused on *why* the change was made — the diff already shows what files changed.
5. The GitHub Actions workflow runs automatically on your PR. A green check is required before merging.

---

## Adding a new package

When adding a new package under `packages/`:

1. Create `package.json` with `"name": "@signakit/analytics-{name}"` and add it to `pnpm-workspace.yaml` (already covered by `packages/*`).
2. Add a `tsconfig.json` that extends `../../tsconfig.base.json`.
3. Add a `tsup.config.ts` for the build.
4. Add a `vitest.config.ts` for tests.
5. If the package depends on `@signakit/analytics-core`, add it as `"workspace:*"` in `dependencies`.
6. Turborepo picks up new packages automatically — no changes to `turbo.json` needed unless you need a custom task pipeline.

---

## Releases

This repo uses [Changesets](https://github.com/changesets/changesets) for versioning and publishing.

When your PR includes a user-facing change, add a changeset:

```bash
pnpm changeset
```

Follow the prompts to select the affected package(s) and bump type (`patch`, `minor`, `major`). Commit the generated file alongside your code changes.

The release workflow runs automatically when changes are merged to `main` — it opens a versioning PR that bumps `package.json` versions and updates changelogs. Merging that PR triggers the npm publish.

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
