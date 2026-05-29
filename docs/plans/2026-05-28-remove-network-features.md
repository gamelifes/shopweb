# Remove All Network Features — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:auto-resume to survive step limits. This is a massive refactoring with 50+ file changes.

**Goal:** Strip MusicFree of all network-dependent functionality, turning it into a pure local file music player that reads and plays audio from the device's local filesystem.

**Architecture:** Delete all plugin/network/search/download subsystems, remove network pages from the navigation tree, strip network dependencies from core services (trackPlayer, lyricManager, bootstrap), simplify the setting/home sidebar, and clean up package.json. The result is a minimal local player with local playlist management, local lyrics, theme/display settings, and no internet access.

**Tech Stack:** React Native 0.76.5 + Expo 52, TypeScript, Jotai, react-native-track-player. Everything network-related (axios, webdav, react-native-fs for downloads) will be removed or replaced.

---

## Phase 0: Foundation (Step 1-5)

### Task 0.1: Simplify Dependency Injection

**Files to modify:**
- Modify: `src/entry/bootstrap/bootstrap.ts:1-38`

**Step 1: Remove plugin/downloader dependencies from bootstrap imports**

Remove these imports from bootstrap.ts:
```typescript
import downloader, { DownloadFailReason, DownloaderEvent } from "@/core/downloader";
import PluginManager from "@/core/pluginManager";
```

And remove the dependency injection lines:
```typescript
PluginManager.injectDependencies(Config);
TrackPlayer.injectDependencies(Config, musicHistory, PluginManager);
downloader.injectDependencies(Config, PluginManager);
lyricManager.injectDependencies(TrackPlayer, Config, PluginManager);
```

Change TrackPlayer injection to:
```typescript
TrackPlayer.injectDependencies(Config, musicHistory);
```

Change lyricManager injection to:
```typescript
lyricManager.injectDependencies(TrackPlayer, Config);
```

Remove the downloader injection entirely.

**Step 2: Mark completed**

---

### Task 0.2: Simplify Bootstrap Initialization

**Files to modify:**
- Modify: `src/entry/bootstrap/bootstrap.ts:100-210`

**Step 1: Remove plugin loading and downloader initialization**

In the bootstrap function, remove:
```typescript
// 加载插件
await PluginManager.setup();
```
And remove the downloader events listener setup.

Also modify the `skipBootstrapStorageDialog` check to still work without plugin references.

**Step 2: Mark completed**

---

### Task 0.3: Remove Network from TrackPlayer

**Files to modify:**
- Modify: `src/core/trackPlayer/index.ts:1-20`

**Step 1: Remove Network import and usage**

Remove:
```typescript
import Network from "@/utils/network";
```
Remove `IPluginManager` from the interface imports.

Remove the `FORBID_CELLUAR_NETWORK_PLAY` constant and any logic that checks network state before playback.

Simplify `injectDependencies` to remove `IPluginManager` parameter.

**Step 2: Mark completed**

---

### Task 0.4: Remove Network from LyricManager

**Files to modify:**
- Modify: `src/core/lyricManager.ts:1-50`

**Step 1: Remove plugin dependency**

Remove `IPluginManager` from constructor parameter.
Remove `pluginManager` injection.
Remove the `searchSimilarLyric` method (which uses plugins).
Keep only local lyric parsing (LRC files from local music files).

**Step 2: Mark completed**

---

## Phase 1: Delete Entire Subsystems (Step 6-20)

### Task 1.1: Delete Plugin Manager System

**Files to delete:**
- Delete: `src/core/pluginManager/index.ts`
- Delete: `src/core/pluginManager/plugin.ts`
- Delete: `src/core/pluginManager/meta.ts`
- Delete: `src/core/pluginManager/`

**Step 1: Delete entire pluginManager directory**

Remove the directory recursively. This removes the core plugin loading sandbox, plugin caching, plugin order management, and all plugin lifecycle code.

**Step 2: Mark completed**

---

### Task 1.2: Delete Downloader

**Files to delete:**
- Delete: `src/core/downloader.ts`

**Step 1: Delete downloader module**

**Step 2: Mark completed**

---

### Task 1.3: Delete Network Utility

**Files to delete:**
- Delete: `src/utils/network.ts`

**Step 1: Delete network state detection module**

**Step 2: Mark completed**

---

### Task 1.4: Delete CheckUpdate

**Files to delete:**
- Delete: `src/utils/checkUpdate.ts`

**Step 1: Delete update checking module**

**Step 2: Mark completed**

---

### Task 1.5: Delete useCheckUpdate Hook

**Files to delete:**
- Delete: `src/hooks/useCheckUpdate.ts`

**Step 1: Delete check update hook**

**Step 2: Mark completed**

---

### Task 1.6: Delete Debug Components

**Files to delete:**
- Delete: `src/components/debug/index.tsx`
- Delete: `src/lib/react-native-vdebug/` (entire directory)

**Step 1: Delete debug component and vendored debug library**

The vdebug library contains `eval()` and is a debugging tool. Removing it eliminates the only `eval()` usage outside the plugin system.

**Step 2: Mark completed**

---

### Task 1.7: Delete Network Pages (Batch 1)

**Files to delete:**
- Delete: `src/pages/searchPage/` (entire directory)
- Delete: `src/pages/searchMusicList/` (entire directory)
- Delete: `src/pages/recommendSheets/` (entire directory)
- Delete: `src/pages/pluginSheetDetail/` (entire directory)
- Delete: `src/pages/topList/` (entire directory)
- Delete: `src/pages/topListDetail/` (entire directory)

**Step 1: Delete search, recommend, plugin sheet, and top list pages**

These pages all depend on PluginManager for fetching data from network sources.

**Step 2: Mark completed**

---

### Task 1.8: Delete Downloading Page and Editor Pages

**Files to delete:**
- Delete: `src/pages/downloading/` (entire directory)
- Delete: `src/pages/musicListEditor/` (entire directory)

**Step 1: Delete downloading and music list editor pages**

Downloading shows active downloads (network feature).
MusicListEditor depends on downloader (for batch download).

**Step 2: Mark completed**

---

### Task 1.9: Delete Album/Artist Pages (Plugin-dependent)

**Files to delete:**
- Delete: `src/pages/albumDetail/` (entire directory)
- Delete: `src/pages/artistDetail/` (entire directory)

**Step 1: Delete album and artist detail pages**

These pages fetch data from plugins (album tracks, artist info). Without plugins they are non-functional.

**Step 2: Mark completed**

---

## Phase 2: Remove Network Panels & Dialogs (Step 21-28)

### Task 2.1: Delete Network Panels

**Files to delete:**
- Delete: `src/components/panels/types/searchLrc/` (entire directory)
- Delete: `src/components/panels/types/musicComment/` (entire directory)
- Delete: `src/components/panels/types/importMusicSheet.tsx`

**Step 1: Delete plugin-dependent panels**

SearchLrc uses plugins to search for lyrics online.
MusicComment uses plugins to fetch comments.
ImportMusicSheet uses plugins to import external music sheets.

**Step 2: Mark completed**

---

### Task 2.2: Delete Network Dialogs

**Files to delete:**
- Delete: `src/components/dialogs/components/downloadDialog.tsx`
- Delete: `src/components/dialogs/components/subscribePluginDialog.tsx`

**Step 1: Delete plugin/download dialogs**

DownloadDialog is for managing downloads.
SubscribePluginDialog is for adding plugin subscriptions.

**Step 2: Mark completed**

---

## Phase 3: Simplify Setting Pages (Step 29-33)

### Task 3.1: Remove Plugin Setting

**Files to delete:**
- Delete: `src/pages/setting/settingTypes/pluginSetting/` (entire directory)

**Step 1: Delete plugin setting page and all its sub-views/components**

PluginSetting includes plugin list, sort, subscribe, and individual plugin config views.

**Step 2: Mark completed**

---

### Task 3.2: Simplify Backup Setting

**Files to modify:**
- Modify: `src/pages/setting/settingTypes/backupSetting.tsx`
- Or delete it entirely if local-only doesn't need backup

**Step 1: Remove or simplify backup setting**

Backup currently supports network backup (upload/download from URL). Either remove entirely or simplify to local-only file backup. Since the user wants pure local playback, delete it.

If deleted, also remove from setting index.

**Step 2: Mark completed**

---

### Task 3.3: Update Setting Index

**Files to modify:**
- Modify: `src/pages/setting/settingTypes/index.ts`

**Step 1: Remove plugin and backup from setting types**

Remove:
```typescript
import BackupSetting from "./backupSetting";
import PluginSetting from "./pluginSetting";
```
Remove the `plugin` and `backup` entries from the `settingTypes` object.

**Step 2: Mark completed**

---

### Task 3.4: Simplify Basic Setting

**Files to modify:**
- Modify: `src/pages/setting/settingTypes/basicSetting.tsx`

**Step 1: Remove plugin-related options from basic setting**

Basic setting has sections for plugin lazy loading, devLog, network play restrictions, etc. Remove or simplify these. Also remove the error log viewer that references `useCheckUpdate`.

**Step 2: Mark completed**

---

### Task 3.5: Simplify About Setting

**Files to modify:**
- Modify: `src/pages/setting/settingTypes/aboutSetting.tsx`

**Step 1: Remove network-related content**

The about page has links to GitHub, plugin repos, update channels. Keep the basic app info but remove plugin/update references.

**Step 2: Mark completed**

---

## Phase 4: Simplify Home and Navigation (Step 34-38)

### Task 4.1: Simplify Home Sidebar Drawer

**Files to modify:**
- Modify: `src/pages/home/components/drawer/index.tsx`

**Step 1: Remove network-related navigation items**

Remove:
- Plugin Management (navigate to plugin setting)
- Backup & Restore (navigate to backup setting)
- Check Update (uses checkUpdate)
- Remove import of `useCheckUpdate`

Keep: Basic Settings, Theme Settings, Language, About, Schedule Close, Back to Desktop, Exit App

**Step 2: Mark completed**

---

### Task 4.2: Update Router Route Paths

**Files to modify:**
- Modify: `src/core/router/index.ts`

**Step 1: Remove network route paths**

Remove from `ROUTE_PATH`:
```
SEARCH_PAGE: "search-page"
ALBUM_DETAIL: "album-detail"
ARTIST_DETAIL: "artist-detail"
TOP_LIST: "top-list"
TOP_LIST_DETAIL: "top-list-detail"
DOWNLOADING: "downloading"
SEARCH_MUSIC_LIST: "search-music-list"
MUSIC_LIST_EDITOR: "music-list-editor"
RECOMMEND_SHEETS: "recommend-sheets"
PLUGIN_SHEET_DETAIL: "plugin-sheet-detail"
```

Remove corresponding `RouterParams` entries for the removed routes.

**Step 2: Mark completed**

---

### Task 4.3: Update Route Component Registry

**Files to modify:**
- Modify: `src/core/router/routes.tsx`

**Step 1: Remove network page imports and route entries**

Remove imports:
```typescript
import TopList from "@/pages/topList";
import TopListDetail from "@/pages/topListDetail";
import SearchPage from "@/pages/searchPage";
import AlbumDetail from "@/pages/albumDetail";
import ArtistDetail from "@/pages/artistDetail";
import Downloading from "@/pages/downloading";
import SearchMusicList from "@/pages/searchMusicList";
import MusicListEditor from "@/pages/musicListEditor";
import RecommendSheets from "@/pages/recommendSheets";
import PluginSheetDetail from "@/pages/pluginSheetDetail";
```

Remove corresponding entries from the `routes` array.

**Step 2: Mark completed**

---

## Phase 5: Clean Up Home Body (Step 39-41)

### Task 5.1: Simplify Home Body

**Files to modify:**
- Modify: `src/pages/home/components/homeBody/` (check what's inside)
- Modify: `src/pages/home/components/homeBodyHorizontal/`

**Step 1: Remove network-dependent sections from home page**

The home body likely shows plugin-based sections (recommendations, etc.). Remove these and keep only local music/library sections.

**Step 2: Mark completed**

---

## Phase 6: Clean Up Music Detail Page (Step 42-44)

### Task 6.1: Simplify Music Detail Operations

**Files to modify:**
- Modify: `src/pages/musicDetail/components/content/albumCover/operations.tsx`

**Step 1: Remove plugin and download operations**

Remove import and usage of `PluginManager` and `downloader`.
Remove the download button, plugin-based search for album art, etc.

**Step 2: Mark completed**

---

### Task 6.2: Simplify Music Item Options Panel

**Files to modify:**
- Modify: `src/components/panels/types/musicItemOptions.tsx`
- Modify: `src/components/panels/types/musicItemLyricOptions.tsx`

**Step 1: Remove plugin-dependent actions**

Remove download action, plugin-based share, plugin-based actions.
Remove import of `pluginManager` and `downloader`.

**Step 2: Mark completed**

---

### Task 6.3: Remove Associate Lrc (if plugin-dependent)

**Files to check:**
- Check: `src/components/panels/types/associateLrc.tsx`

**Step 1: Check if associateLrc depends on plugins**

If it uses plugins, simplify or remove. Keep if it works with local files only.

**Step 2: Mark completed**

---

## Phase 7: Clean Package.json Dependencies (Step 45-47)

### Task 7.1: Identify Removable Dependencies

**Step 1: Determine which npm packages are no longer needed**

Likely candidates:
- `axios` — used by plugin system and checkUpdate
- `webdav` — used by plugins for WebDAV
- `react-native-fs` — may still be needed for local file browsing
- `react-native-image-colors` — may still be needed
- `cheerio` / `cheerio-without-node-native` — plugin sandbox only
- `crypto-js` — plugin sandbox only
- `dayjs` — plugin sandbox only (check if used elsewhere)
- `qs` — plugin sandbox only (check if used elsewhere)
- `he` — plugin sandbox only
- `compare-versions` — used by plugin system and checkUpdate

Keep if used for local features: `react-native-fs` (file browsing), `react-native-image-colors` (album art colors).

**Step 2: Mark completed**

---

### Task 7.2: Remove Dependencies from package.json

**Files to modify:**
- Modify: `package.json`

**Step 1: Remove unnecessary dependencies**

Run `npm uninstall` for each identified package, or manually edit package.json and run `npm install`.

**Step 2: Mark completed**

---

## Phase 8: Type Cleanup (Step 48)

### Task 8.1: Remove Plugin-related Types (if safe)

**Files to check:**
- Check: `src/types/core/pluginManager/`
- Check: `src/types/plugin.d.ts`
- Check: `src/types/core/downloader.d.ts`

**Step 1: Check if plugin types are referenced by remaining code**

If no remaining code imports these types, delete them. Be careful — type-only imports may be used by remaining components.

**Step 2: Mark completed**

---

## Phase 9: Tab Bar / Bottom Navigation (Step 49)

### Task 9.1: Check Entry Navigation

**Files to check:**
- Check: `src/entry/index.tsx`

**Step 1: Remove references to Debug and deleted pages**

Remove Debug component import.
Remove any bottom tab items for search, recommend, download.

**Step 2: Mark completed**

---

## Phase 10: Verification (Step 50)

### Task 10.1: Run TypeScript Check

**Step 1: Run `npx tsc --noEmit`**

Fix any type errors that arise from deleted modules being referenced by remaining code.

**Step 2: Mark completed**

---

### Task 10.2: Run Lint

**Step 1: Run `npm run lint`**

Fix any lint errors.

**Step 2: Mark completed**

---

## Execution Order (Why This Sequence)

1. **Phase 0 (Dependency Injection first)** — Modify bootstrap, trackPlayer, lyricManager BEFORE deleting pluginManager and downloader, so we can remove the imports cleanly
2. **Phase 1 (Delete subsystems)** — Remove pluginManager, downloader, network utils, and all network pages
3. **Phase 2 (Panels & Dialogs)** — Remove network-dependent UI components
4. **Phase 3-5 (Settings & Navigation)** — Simplify settings pages, sidebar, routes
5. **Phase 6 (Music Detail)** — Clean up music detail operations
6. **Phase 7 (Dependencies)** — Clean package.json
7. **Phase 8 (Types)** — Clean type declarations
8. **Phase 9 (Entry)** — Final entry point cleanup
9. **Phase 10 (Verify)** — Run tsc and lint

**Why this order:** We must modify the core services that *use* network modules BEFORE we delete those modules, to avoid import errors. Then we delete everything, clean up remaining UI, and finally verify.
