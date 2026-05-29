# MusicFree — Agent Guide

Plugin-based, ad-free music player for Android / Harmony OS.
React Native 0.76.5 + Expo 52, TypeScript, Jotai, react-native-track-player.

## Quick commands

| Command | Purpose |
|---------|---------|
| `npm run lint` | ESLint with `--fix` (src/ only, exts `.js,.jsx,.ts,.tsx`) |
| `npm run test` | Jest (no tests exist yet — preset react-native) |
| `npx tsc --noEmit` | TypeScript type check |
| `npm start` | Metro dev server |
| `npm run android` | `react-native run-android` |
| `npm run ios` | `react-native run-ios` |
| `npm run build-android` | Gradle `assembleRelease` |
| `npm run connect-mumu` | ADB connect to MuMu emulator (localhost:7555) |
| `npm run clean` | Gradle clean (android/) |
| `npm run generate-assets` | Icon/font asset generation via `generator/generate-assets.mjs` |
| `npm run prepare` | Husky install (post-clone hook) |

## Architecture

```
index.js              → App entry (registers Pages + TrackPlayer service)
src/entry/index.tsx   → Navigation container + route stack
src/entry/bootstrap/  → App initialization (permissions, config, plugin loading)
src/core/             → Business logic: appConfig, pluginManager, trackPlayer,
│                        musicSheet, downloader, lyricManager, theme, router
src/pages/            → 19 screen components (home, musicDetail, search, etc.)
src/components/       → Reusable UI (base/, dialogs/, panels/, musicItem/, etc.)
src/utils/            → Helpers: storage, network, log, lrcParser, toast, etc.
src/types/            → Global `.d.ts` type declarations (IPlugin, IMusic, ICommon, etc.)
src/constants/        → Enums, common consts, asset/path configs
src/native/           → Native module wrappers (lyricUtil, mp3Util, utils)
src/service/          → TrackPlayer playback service (background audio)
```

## Key technical details

- **State management**: Jotai atoms + MMKV for config (`App.config`, `App.PersistStatus`). AsyncStorage used only for legacy migration.
- **Plugin system**: Plugins are CommonJS modules evaluated in a sandbox with injected libs (axios, cheerio, crypto-js, dayjs, qs, he, webdav). They expose `search()`, `getMediaSource()`, `getAlbumInfo()`, etc. See `src/core/pluginManager/plugin.ts` and `src/types/plugin.d.ts`.
- **Path aliases**: `@/` → `./src/` (via babel-plugin-module-resolver + tsconfig paths).
- **Navigation**: React Navigation native stack + drawer.
- **Audio**: react-native-track-player. Playback service at `src/service/index.ts`.
- **SVG imports**: Enabled via `react-native-svg-transformer` in metro config.
- **Theme**: `src/core/theme.ts`, supports light/dark + custom background.
- **i18n**: `src/core/i18n/`.

## Linting & style

- ESLint extends `@react-native` + `prettier`. Rules: 4-space indent, double quotes, trailing commas where valid, brace-style `1tbs`.
- **Quirk**: Prettier config has `singleQuote: true` but ESLint overwrites to `["warn", "double"]`. Always use double quotes.
- ESLint ignores `src/lib/`.
- `src/types/` files are `.d.ts` with `declare namespace` (not `export`). Do not convert to ES modules.

## Commit conventions

- Conventional commits via commitlint (`@commitlint/config-conventional`).
- Allowed types: `ci`, `chore`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`.
- Pre-commit: `npm run lint-staged` (runs lint on `src/**/*.{ts,tsx}`).
- Commit-msg: `npm run commit-lint`.

## Build

- Beta CI (`.github/workflows/build-beta.yml`): triggers on `dev` branch pushes to `package.json` where version matches `-beta.XX` pattern. Builds `assembleRelease` with JDK 17, Node 20.
- `android/keystore.properties` is gitignored. For local release builds, create it from CI workflow template.
- iOS build requires CocoaPods (Gemfile provided). Note: README says Android/Harmony OS only — iOS is experimental.

## Other gotchas

- `noImplicitAny: false` in tsconfig — TS will not error on implicit `any`. Do not rely on strict checks.
- `skipLibCheck: true` — skips `.d.ts` checking.
- The `src/lib/react-native-vdebug/` directory is excluded from lint and is a local vendored package.
- `expo-splash-screen` is used but UI is native-stack based, not Expo Router.
- No unit tests or integration tests exist yet. Jest config is `preset: react-native`.
- Do not add new `.js` files to `src/` unless necessary — project uses TypeScript for all source.
