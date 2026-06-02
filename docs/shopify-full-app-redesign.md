# MusicFree Shopify 风格全 App 改造设计文档

## 一、设计哲学

### 设计目标
将 MusicFree 整体视觉风格改造为 **Shopify 风格**——干净、现代、动感、有呼吸感。保留全部现有功能逻辑，只改视觉层。

### Shopify 设计语言核心
| 原则 | 说明 |
|------|------|
| **Content First** | 内容为王，装饰让位于功能 |
| **Breathing Space** | 充足间距，不拥挤 |
| **Bold Typography** | 大胆字体层级，粗重标题 |
| **Subtle Depth** | 微妙阴影、磨砂玻璃、层级感 |
| **Deliberate Color** | 主题色精准使用，不泛滥 |
| **Smooth Motion** | 自然缓动，150-300ms 微交互动效 |
| **Card-based UI** | 圆角卡片化，统一视觉容器 |

### 与现有设计的关系
- 保留 dark/light 主题系统（`src/core/theme.ts`）
- 保留 `colors.primary` 主色调（浅色 `#f17d34` / 深色 `#3FA3B5`）
- 所有改动在现有颜色变量基础上做视觉优化，不改颜色系统本身
- 当前已实现的播放页毛玻璃/黑胶旋转/功能标签属于新风格的前哨

---

## 二、全局设计体系

### 2.1 间距系统

统一使用 8 点网格系统（基于 `rpx` 换算）：

| Token | rpx 值 | 用途 |
|-------|--------|------|
| `spacing-xxs` | rpx(8) | 极小间距，图标与文字间 |
| `spacing-xs` | rpx(16) | 内边距，小元素间距 |
| `spacing-sm` | rpx(24) | 标准边距（当前默认 paddingHorizontal） |
| `spacing-md` | rpx(32) | 区块间距 |
| `spacing-lg` | rpx(48) | 大区块间距 |
| `spacing-xl` | rpx(64) | 页面顶部/底部大间距 |

**影响**：目前各页面硬编码间距（如 `paddingHorizontal: rpx(24)`），保持统一。

### 2.2 圆角系统

| Token | 值 | 用途 |
|-------|-----|------|
| `radius-sm` | rpx(8) | 小按钮 |
| `radius-md` | rpx(12) | 普通卡片 |
| `radius-lg` | rpx(18) | 大卡片、列表项 |
| `radius-xl` | rpx(24) | 超大圆角 |
| `radius-full` | 9999 | 胶囊按钮 |

### 2.3 阴影系统

React Native 阴影统一模式：
```ts
shadowColor: colors.shadow,
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 8,
elevation: 3,
```

### 2.4 字体层级

| 层级 | fontSize | fontWeight | 用途 |
|------|----------|------------|------|
| `display` | rpx(48) | 700 | 大标题（极少使用） |
| `appbar` | rpx(36) | 700 | 页面大标题 |
| `title` | rpx(32) | 700 | 区块标题（加粗） |
| `content` | rpx(28) | 400 | 正文 |
| `subTitle` | rpx(26) | 500 | 辅助文字 |
| `description` | rpx(22) | 400 | 描述文字 |
| `caption` | rpx(18) | 400 | 小字（时间戳等） |
| `tag` | rpx(20) | 500 | 标签文字 |

---

## 三、全局组件改造

### 3.1 PageBackground — 全 App 背景层

**现状**：`src/components/base/pageBackground.tsx`
- 纯色 `colors.pageBackground` + 可选自定义模糊图片（仅 custom theme）

**改造方案**：
```
当前: [Solid bg color] (+ optional blurred image for custom themes)
改后: [Solid bg color] + [Subtle gradient overlay] (+ optional blurred image)
```

- 在纯色背景上叠加一层 `LinearGradient` 微渐变（从 `colors.primary` 极低透明度到透明）
- 梯度方向：从上到下（顶部略微带主题色氛围）
- 透明度控制在 3-5% 之间，非常微妙，仅增加层次感
- 仅在 p-light / p-dark 主题下生效（custom theme 已有背景图）

**影响范围**：Drawer、Home、SheetDetail、Setting 等所有使用 `PageBackground` 的页面。

### 3.2 AppBar — 统一顶部导航栏

**现状**：`src/components/base/appBar.tsx`
- 纯色背景 `colors.appBar`，高度 rpx(88)
- 返回箭头 + 标题 + 右侧菜单按钮

**改造方案**：
```
当前: Solid appBar bg, rpx(88) height
改后: Semi-transparent frosted bg, rpx(76) height, subtle bottom border
```

- 背景从纯色改为 `colors.appBar` + 透明度 `0.85`（露出 PageBackground）
- 高度降低到 rpx(76)
- 底部添加 1px 分割线 `colors.divider`
- 标题字体加粗（`fontWeight: 700`）
- 返回箭头和菜单按钮尺寸微调

**涉及文件**：`src/components/base/appBar.tsx`

### 3.3 MusicBar — 底部迷你播放器

**现状**：`src/components/musicBar/index.tsx`
- 纯色背景 `colors.musicBar`，高度 rpx(132)
- 左侧：小封面 + 歌名/歌手（MusicInfo 组件）
- 中间：圆形进度按钮（CircularProgressBase）
- 右侧：播放列表图标

**改造方案**：

```
┌──────────────────────────────────────┐
│  ┌────┐  歌名标题                    │
│  │封面│  歌手名字    ▶  [≡]          │
│  └────┘  进度条 ▓▓▓▓░░░░            │
└──────────────────────────────────────┘
```

- **背景**：改为半透明磨砂效果（`rgba` 毛玻璃，露出 PageBackground）
- **布局**：改为 2 行结构
  - 第一行：封面缩略图（缩小到 rpx(64)）+ 歌名（粗体）+ 歌手 + 播放按钮 + 列表按钮
  - 第二行：迷你进度条（高度 rpx(3)，圆角，渐变色）
- **封面**：加圆角 `borderRadius: rpx(8)` 和微弱阴影
- **字体**：歌名使用 `title` 层级加粗，歌手使用 `description` 层级
- **播放按钮**：去掉 CircularProgress 环，改为纯图标按钮（保持干净）
- **高度**：调整为 rpx(156)（增加进度条行）

**涉及文件**：`src/components/musicBar/index.tsx`、`src/components/musicBar/musicInfo.tsx`

### 3.4 NavBar — 首页导航

**现状**：`src/pages/home/components/navBar.tsx`
- Hamburger ☰ 图标 + "MusicFree" 文字

**改造方案**：
```
当前: ☰  MusicFree
改后: ☰  MusicFree  [🔍]
```

- 保留透明背景
- "MusicFree" 字体改为粗体（700）
- 右侧添加搜索图标（跳转到搜索页或搜索面板）
- 搜索功能：导航到搜索页面或打开搜索面板

### 3.5 Drawer — 侧边栏

**现状**：`src/pages/home/components/drawer/index.tsx`
- 纯列表样式，每项有 icon + title

**改造方案**：
```
当前: 纯列表，icon + 文字
改后: 圆角卡片分组，加大间距，粗体标签
```

- 每个 `card` 容器增加圆角 `borderRadius: rpx(12)` 和微弱背景色
- 分组标题（"设置"、"其他"、"软件"）改为粗体 + 大号字
- 菜单项增加 hover/active 状态反馈（已有 `listActive` 颜色）
- 底部退出按钮区域增加分割线留白

**涉及文件**：`src/pages/home/components/drawer/index.tsx`

---

## 四、各页面改造

### 4.1 首页 Home

**文件**：`src/pages/home/index.tsx`

**改造点**：

**A. Operations 区域**（`homeBody/operations.tsx`）
```
当前: 两按钮横向排列 (播放历史, 本地音乐)
改后: 圆角卡片网格，带 icon + 标题 + 微箭头指示
```

- 每个 ActionButton 改为圆角卡片 `borderRadius: rpx(12)`，高度 rpx(160)
- 图标放大，放在卡片中央偏上
- 标题放在图标下方
- 右侧添加微量箭头 `>` 指示可点击

**B. Sheets 列表**（`homeBody/sheets.tsx`）
```
当前: Tab 切换（我的歌单/收藏歌单）+ FlashList 列表
改后: 保留 Tab 结构，列表项改为卡片样式
```

- 列表项增加圆角 `borderRadius: rpx(8)` 和微弱阴影
- 封面图圆角加大（`borderRadius: rpx(8)`）
- 标题字体加粗，描述字体用 `description` 层级灰色
- 删除按钮（trash）统一放在右侧，保持对齐

### 4.2 歌单详情 SheetDetail

**文件**：`src/pages/sheetDetail/index.tsx`

**改造点**：
- NavBar 背景改为 `rgba` 半透明（同 AppBar 改造）
- 列表行间距加大，歌曲编号字体改为粗体
- 使用 `SheetMusicList` 中的行组件，增加圆角

### 4.3 本地音乐 LocalMusic

**文件**：`src/pages/localMusic/mainPage/index.tsx`

- 改造 AppBar（同全局 AppBar 改造）
- 列表样式统一（同 Sheets 改造）

### 4.4 播放历史 History

**文件**：`src/pages/history/index.tsx`

- 改造 AppBar（同全局）
- 列表样式统一

### 4.5 设置 Setting

**文件**：`src/pages/setting/index.tsx`

- 改造 AppBar（同全局）
- 设置项列表增加卡片分组和圆角

### 4.6 播放页 MusicDetail（已完成部分）

**文件**：`src/pages/musicDetail/*` ✅ 已完成

**已实现**：
- ✅ 毛玻璃背景 + LinearGradient 叠加（`background.tsx`）
- ✅ 功能标签组件（`featureTags.tsx`）：音效/品质 两胶囊按钮（AI 模式已移除）
- ✅ 黑胶唱片旋转动画 + 外环（`albumCover/index.tsx`）
- ✅ 歌词遮罩层
- ✅ NavBar 透明磨砂样式
- ✅ 底部三行布局（操作/进度/控制）
- ✅ Operations 仅保留收藏和分享

**待优化**：
- 封面区域与歌词的 tab 切换逻辑已恢复

### 4.7 均衡器面板（新增）

**位置**：`src/components/equalizerPanel/index.tsx`（新文件）

**触发方式**：点击播放页 `featureTags` 中的 "音效" 按钮 → 底部弹出 EqPanel

**前端组件**：

```
src/components/equalizerPanel/
  └── index.tsx              # 均衡器面板主组件 (BottomSheet)
```

**面板 UI 结构**：

```
┌──────────────────────────────────────┐
│  ─── (拖拽手柄)                       │
│                                      │
│  音效 & 均衡器                   ✕   │
├──────────────────────────────────────┤
│  音效总开关                     [●━]  │  ← iOS 风格 toggle
├──────────────────────────────────────┤
│  预设                                │
│  正常 │ 流行 │ 摇滚 │ 爵士 │          │  ← 圆形按钮，激活态橙色边框
│  古典 │ 舞曲 │ 人声 │ 自定义 │        │
├──────────────────────────────────────┤
│  60Hz   ▂▂▂▂▂◉▂▂▂▂▂  +4dB   │  ← 增益滑块
│  230Hz  ▂▂▂▂◉▂▂▂▂▂▂   0dB   │     中心 0dB
│  910Hz  ▂▂◉▂▂▂▂▂▂▂▂  -3dB   │     右=增益(橙) 左=衰减(蓝)
│  3.6kHz ▂▂▂▂▂▂◉▂▂▂  +2dB   │
│  14kHz  ▂▂▂▂▂▂▂◉▂▂  +5dB   │
├──────────────────────────────────────┤
│  🔊 Bass Boost    ████◉░░   60%  │  ← 效果滑块
│  🌐 Virtualizer   ██◉░░░░   35%  │
│  📢 Loudness      ██████◉░  80%  │
├──────────────────────────────────────┤
│  注：所有滑块均为 touch 可拖拽         │
└──────────────────────────────────────┘
```

**设计规范**：
- 面板底色：`colors.bodyBackground` 或 `rgba(37,37,43,0.98)`（深色）
- 圆角顶部：`borderTopLeftRadius: 24, borderTopRightRadius: 24`
- 拖拽手柄：居中 36x4px 浅灰圆角条
- 滑条轨道：高度 4px，圆角 2px，背景 `rgba(255,255,255,0.1)`
- 增益滑块圆点：18x18px 白色，带微弱阴影
- 预设按钮：默认 12px/500w, 激活态橙色主题色
- 总开关：iOS 原生风格 toggle

**Android 原生层**（`src/native/audioEffect/`）：

| 文件 | 用途 |
|------|------|
| `AudioEffectModule.kt` | 封装 Android `android.media.audiofx` 原生 API |
| `AudioEffectPackage.kt` | React Native 包注册 |
| `index.ts` | TypeScript 桥接层 |

**原生 API 映射**：

| Android API | 功能 | 绑定方式 |
|-------------|------|----------|
| `Equalizer` | 多频段均衡 + 预设 | 挂载到 TrackPlayer audio session ID |
| `BassBoost` | 低音增强 (0-1000) | 独立开关 + 强度滑块 |
| `Virtualizer` | 3D 虚拟环绕声 (0-1000) | 独立开关 + 强度滑块 |
| `LoudnessEnhancer` | 响度增强 (millibels) | 独立开关 + 强度滑块 |

**状态管理**（扩展 `featureTagsAtom.ts`）：

```ts
// 新增状态
interface EqState {
  enabled: boolean;              // 总开关
  preset: string;                // 'Normal' | 'Pop' | 'Rock' | etc.
  bands: number[];               // 各频段增益值 [-15..+15]
  bassBoost: number;             // 0-100
  virtualizer: number;           // 0-100
  loudness: number;              // 0-100
}

// 默认预设 "Normal": [0, 0, 0, 0, 0]
// 预设 "Pop":      [+3, +1, -1, +2, +4]
// 预设 "Rock":     [+5, +3, -2, +1, +3]
// 预设 "Jazz":     [+4, +2, -1, +1, +3]
// 预设 "Classic":  [+4, +2, 0, +1, +3]
// 预设 "Dance":    [+5, +3, -1, +2, +4]
// 预设 "Vocal":    [-1, +2, +4, +3, 0]
// 预设 "Custom":   用户自定义
```

**实现步骤**：
1. 创建 `AudioEffectModule.kt` 原生模块，实现 Equalizer/BassBoost/Virtualizer/LoudnessEnhancer 初始化与绑定
2. 创建 `AudioEffectPackage.kt` 注册模块
3. 创建 `src/native/audioEffect/index.ts` TypeScript 接口
4. 扩展 `featureTagsAtom.ts` 加入 EqState
5. 创建 `equalizerPanel/index.tsx` UI 组件（BottomSheet + 预设网格 + 频段滑块 + 效果滑块）
6. 在播放页 `musicDetail/index.tsx` 中引入面板，点击 "音效" 按钮时弹出
7. 面板与原生模块的绑定：滑块调整 → 调用原生 API 更新音频效果

**设计参考**：[HTML mockup] `docs/shopify-design-mockup.html` Phone 5 "🎛️ 音效面板"

---

## 五、动效系统

### 5.1 全局动效规范

| 场景 | 动画 | 时长 | 缓动 |
|------|------|------|------|
| 页面切换 | slide_from_right | 150ms | 保持现有 |
| 按钮点击 | scale 0.97 → 1.0 | 150ms | ease-out |
| 列表进入 | fade-in + translateY(10→0) | 200ms | ease-out |
| 播放/暂停 | icon 切换缩放 1.0→1.15→1.0 | 200ms | spring |
| 进度条拖动 | 无额外动画 | — | — |

### 5.2 已有动画保留
- 黑胶唱片旋转动画（已实现）：continuous rotation with reanimated
- AppBar 菜单弹出动画（已存在）：withTiming with Easing.exp

---

## 六、改造优先级

### Phase 1 — 视觉骨架（影响面最大）
| 组件 | 预计工时 | 影响页面数 |
|------|---------|-----------|
| PageBackground 渐变层 | 小 | 全部页面 |
| AppBar 半透明毛玻璃 | 中 | Setting, History, LocalMusic, SheetDetail |
| MusicBar 底部播放器 | 大 | Home, SheetDetail, History, LocalMusic |
| NavBar 首页 + 搜索 | 小 | Home |

### Phase 2 — 页面精细化
| 页面 | 改造项 | 复杂度 |
|------|--------|--------|
| 均衡器面板 | 原生模块+UI面板+Kotlin | **大** |
| Home Operations | 卡片化 | 小 |
| Home Sheets | 列表卡片化 | 中 |
| Drawer | 卡片分组 | 中 |
| 其他页面列表 | 统一样式 | 小 |

### Phase 3 — 动效与细节
| 项目 | 说明 |
|------|------|
| 按钮点击缩放反馈 | 全局 IconButton 封装 |
| 列表 fade-in 动画 | FlashList 的 animateOnMount |
| 自定义过渡 | 页面切换动画微调 |

---

## 七、文件变更清单

### 已改造组件
```
src/components/base/pageBackground.tsx     → 添加微渐变叠加层
src/components/base/appBar.tsx             → 半透明毛玻璃，降低高度
src/components/musicBar/index.tsx          → 重构为2行布局，磨砂卡片
src/components/musicBar/musicInfo.tsx      → 调整字体和布局（如需要）
src/pages/home/components/navBar.tsx       → 加粗标题，添加搜索图标
src/pages/home/components/drawer/index.tsx  → 卡片分组，加大间距
src/pages/home/components/homeBody/operations.tsx → 卡片化改造
src/pages/home/components/homeBody/sheets.tsx → 列表卡片化
src/pages/sheetDetail/index.tsx            → AppBar 改造
src/pages/localMusic/mainPage/index.tsx    → AppBar 改造
src/pages/history/index.tsx                → AppBar 改造
src/pages/setting/index.tsx                → AppBar 改造
```

### 均衡器面板（新增文件）
```
src/native/audioEffect/AudioEffectModule.kt    → 原生均衡器封装
src/native/audioEffect/AudioEffectPackage.kt   → RN 包注册
src/native/audioEffect/index.ts                → TS 桥接层
src/components/equalizerPanel/index.tsx        → 均衡器 UI 面板
src/store/featureTagsAtom.ts                   → 扩展 EqState
```

---

## 八、设计验证

完成后使用以下 checkpoints 验证：
1. `npx tsc --noEmit` — 无类型错误
2. `npm run lint` — 无 lint 错误
3. 所有功能按钮仍可正常导航和交互
4. 浅色/深色主题切换正常
5. 横竖屏布局正常
