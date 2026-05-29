# Playback Page Redesign — RIPPLE MUSIC Style

## Reference
- Zcool: RIPPLE MUSIC by 西门飙血630
  https://www.zcool.com.cn/work/ZMzg0NDM5NzI=.html
- Zcool: Nice Music Concept by CdzhcHappy (icons/effects)
  https://www.zcool.com.cn/work/ZMjA4MjA0MDQ=.html
- Kimi analysis: https://www.kimi.com/share/19e728b8-ee82-8827-8000-0000ebb575fe

## Design Overview (Design 1 — RIPPLE MUSIC)

全屏沉浸式播放界面，毛玻璃/半透明模糊基底 + 居中黑胶唱片式专辑封面。

### Layout Structure

```
┌──────────────────────────────────┐
│  ←    今后我与自己流浪      ⋮   │  ← NavBar (返回 + 标题 + 歌手 + 更多)
│           张碧晨  关注           │
├──────────────────────────────────┤
│  [音效 off]  [标准 ▾] [AI on]   │  ← 功能标签 (新增)
├──────────────────────────────────┤
│                                  │
│          ╭──────────╮            │
│          │ 封面旋转  │            │  ← 黑胶唱片 (旋转动画)
│          │ 歌词遮罩  │            │     + 半透明遮罩手写歌词
│          ╰──────────╯            │
│                                  │
├──────────────────────────────────┤
│  ♥  ↓  💬  ✎  ↗                 │  ← 操作栏 (收藏/下载/评论/弹幕/分享)
│     00:28 ───○─── 04:32         │  ← 进度条
│  🔁  ⏮  ▶️  ⏭  📋              │  ← 播放控制 (循环/上/播放/下/列表)
└──────────────────────────────────┘
```

## File Mapping

| Feature | Current File | Change |
|---------|-------------|--------|
| **Background** | `background.tsx` | Upgrade: keep blur + add dynamic color overlay from album art |
| **NavBar** | `navBar.tsx` | Minor layout tweaks (lower height, add "关注" tag) |
| **Feature Tags** | *(new)* | Create `components/featureTags.tsx` — 3 capsule buttons |
| **Album Cover** | `albumCover/index.tsx` | Add: vinyl rotation animation + outer ring + lyrics mask overlay |
| **Operations** | `albumCover/operations.tsx` | Move to bottom as row 1 (remove from above cover) |
| **SeekBar** | `bottom/seekBar.tsx` | Keep, minor style adjustments |
| **PlayControl** | `bottom/playControl.tsx` | Keep layout, minor spacing adjustments |
| **Bottom** | `bottom/index.tsx` | Refactor: 3 rows (operations → seekbar → playcontrol) |

## Implementation Plan

### Phase 1: Core Visual (Background + Cover)

1. **Background.tsx**
   - Keep `Image blurRadius={50}` for frosted glass
   - Extract dominant color from artwork (via `react-native-vision-camera` frame processor or simpler approach: use a `Color` lib to sample from Image component)
   - Add semi-transparent gradient overlay on top of blur
   - Fallback: use theme `primary` color when artwork unavailable

2. **AlbumCover/index.tsx**
   - Add `react-native-reanimated` rotation animation (continuous loop)
   - Draw vinyl ring outside cover using `react-native-svg` (circle with stroke)
   - Add semi-transparent circular overlay with lyrics text
   - White ring + tick marks for vinyl texture

### Phase 2: Feature Tags

3. **featureTags.tsx** (new component)
   - Three capsule buttons: [音效 off] [标准 ▾] [AI模式 on]
   - `borderRadius: 20`, `borderWidth: StyleSheet.hairlineWidth`
   - Active/inactive state styling
   - Store state in Jotai atoms

### Phase 3: Bottom Bar Restructure

4. **bottom/index.tsx**
   - Row 1: Operations (heart, download, comment, bullet-screen, share)
   - Row 2: SeekBar (time + slider + duration)
   - Row 3: PlayControl (loop, prev, play/pause, next, playlist)

5. **Operations** — Move from above cover to bottom row 1
   - Style icons inline horizontally with equal spacing

## Dependencies Available

- `react-native-reanimated` ^3.17.5 — for rotation animation
- `react-native-gesture-handler` ~2.25.0 — for gesture interactions
- `react-native-svg` ^15.11.2 — for vinyl ring/tick marks
- `react-native-linear-gradient` ^2.8.3 — for gradient overlay
- `react-native-svg-transformer` ^1.5.0 — for SVG imports
- `@react-native-community/slider` — for seek bar (existing)

## Notes
- MusicFree uses Jotai for state management + MMKV for persistence
- Current theme system in `src/core/theme.ts` supports dark/light/custom
- Orientation support: vertical = album cover; horizontal = album + lyrics side by side
- All text/icons currently white against dark background