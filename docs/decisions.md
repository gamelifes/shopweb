# MusicFree 架构决策记录（Decisions）

> 项目级 ADR。每条决策记录：背景、选项、选定方案、理由、影响、替代方案。

---

## ADR-001：自建 AndroidX 播放内核（2026-06-05）

**状态**：草案

**背景**：
- 现有 `react-native-track-player` 4.x 基于 KotlinAudio（Android） + AVQueuePlayer（iOS）
- 2026-06-05 调研发现 RNTP 内部使用 `MediaSessionCompat`，**不暴露 `audioSessionId`**
- 导致 `AudioEffectModule.kt` 无法将 `Equalizer/BassBoost/Virtualizer/LoudnessEnhancer` 绑定到实际播放流
- 当时采取"方案 D 简化"：只做预设切换，砍掉精细滑块（提交 b8d2c54）

**选项**：
- A. 维持 RNTP，方案 D 永久化
- B. 升级到 RNTP 5.x（4.x → 5.x 走新 Media3 架构，但尚未稳定）
- C. 保留 RNTP + 反射拿 sessionId（已验证：失败）
- D. 砍 iOS，自建 AndroidX Media3 内核（**本方案**）
- E. 全平台自建（方案 A，3-4 周，跨平台 C++ 复杂度高）

**选定**：D

**理由**：
1. **直接解锁核心收益**：Media3 `Player.getAudioSessionId()` 是公开 API，5 段 EQ + Bass + Virtualizer + Loudness 全可真实生效
2. **代码量大幅缩减**：砍掉 iOS + 跨平台抽象，1.5-2 周可落地（原方案 A 需 3-4 周）
3. **无破坏性**：引擎核心用 `IPlayer` 适配器模式替换 `RNTP`，UI 层零改动
4. **依赖更清洁**：移除 RNTP 间接依赖链，编译输出减少 ~1.2MB
5. **iOS 不受影响**：现有 RNTP 仍可在 iOS 跑（暂不重构）

**影响**：
- 业务层 `src/core/trackPlayer/index.ts` 内部实现替换，外部接口（`ITrackPlayer`）不变
- 7 处 import `react-native-track-player` 全部清理
- 删 `src/service/index.ts`（功能由 `PlaybackService` 接管）
- 新增 `android/.../engine/` 与 `player/` 目录
- `AndroidManifest.xml` 新增自建 `PlaybackService` 声明
- 删除 `react-native-track-player` 依赖

**替代方案**：
- B 方案若 RNTP 5.x 稳定可重新评估（关注 https://github.com/doublesymmetry/react-native-track-player/releases）
- E 方案若未来需要 iOS 端精细音效再启动

**关联文档**：
- `docs/playback-engine-androidx.md`（设计文档）
- `D:\L_Knowledge\sessions\2026-06-05-audioeffect-plan-d.md`（方案 D 失败根因）
- AndroidX Media issue #2485（MediaSession ID 冲突）

---

## ADR-002：删除网络子系统（2026-05-29）

**状态**：已实施

**概要**：
- 删除 `pluginManager/`、`downloader.ts`、`checkUpdate.ts`、9 个网络页面、5 个网络面板
- MusicFree 转纯本地音乐播放器

**影响**：
- 播放内核不再需要 plugin 数据源，DataSource 范围收窄到本地 file/content URI
- 与本 ADR-001 自建内核设计契合

---

## ADR-003：Shopify 风格设计稿主题对齐（2026-06-03 → 06-04）

**状态**：已实施

**概要**：
- 主题系统与 `shopify-design-mockup.html` 设计稿对齐
- 所有硬编码颜色迁移至 `useColors()`

**影响**：
- 自建内核的通知 / 锁屏 UI 需复用 `useColors()` 取色，遵循同一套主题

---

## ADR-004：音效面板方案 D 简化（2026-06-05）

**状态**：已实施（作为本 ADR-001 的临时方案）

**概要**：
- 砍掉精细滑块，只做预设切换
- 设备不支持时显示提示文案而非崩溃

**影响**：
- 本 ADR-001 实施后，方案 D 的简化版将被"全功能版"取代
- UI 高度从 rpx(420) 扩展到 rpx(780)，恢复 5 段滑块
