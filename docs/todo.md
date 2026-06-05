# MusicFree 下一步任务（Todo）

> 按优先级排序。每条任务含：目标、范围、估时、依赖、验收。

---

## [P0] 自建 AndroidX 播放内核（1.5-2 周）

> 设计文档：`docs/playback-engine-androidx.md`
> 决策记录：`docs/decisions.md` ADR-001

### 阶段 0：脚手架（0.5 天）
- [ ] 新建 `specs/NativePlayerModule.ts` 接口定义
- [ ] 新建 `android/.../engine/` 和 `player/` 目录
- [ ] 新建 `PlayerPackage.kt` 注册
- [ ] 跑 codegen 验证 `NativePlayerModuleSpec.kt` 生成
- **验收**：`npm run build-android` 成功，原 RNTP 路径不变

### 阶段 1：引擎核心 Kotlin（4-5 天）
- [ ] `PlaybackService.kt`：`MediaSessionService` 子类
- [ ] `PlaybackController.kt`：play/pause/seek/setRate/load/skipToNext
- [ ] `PlayQueue.kt`：双向队列（upcoming + history + current）
- [ ] `PlaybackStateMachine.kt`：状态机 + 跃迁表
- [ ] `AudioFocusManager.kt`：焦点请求 + 中断处理
- [ ] `PlaybackEvent.kt`：sealed class 事件类型
- **验收**：单测覆盖率 > 70%，所有跃迁合法路径覆盖

### 阶段 2：桥接层（2-3 天）
- [ ] `NativePlayerModule.kt`：实现 spec 所有方法
- [ ] `RCTDeviceEventEmitter` 事件推送
- [ ] `src/player/NativePlayer.ts`：JSI 包装 + EventEmitter
- [ ] 端到端测试：JS 调 play → 原生执行 → 事件回传
- **验收**：手动在模拟器跑通 play/pause/seek 全链路

### 阶段 3：替换 RNTP（2-3 天）
- [ ] `src/core/trackPlayer/index.ts` 7 处调用替换
- [ ] `src/entry/bootstrap/bootstrap.ts` 初始化流程改造
- [ ] `src/core/lyricManager.ts` 进度事件替换
- [ ] `src/utils/trackUtils.ts` State 枚举替换
- [ ] `src/types/core/trackPlayer/index.d.ts` Progress 类型替换
- [ ] `src/components/panels/types/audioEffect.tsx` 文案更新
- [ ] **保留 RNTP 依赖**（暂不删）作为 fallback
- **验收**：UI 端逐场景回归，无视觉/行为差异

### 阶段 4：音频效果管线（1-2 天）⭐ 核心收益
- [ ] 改造 `AudioEffectModule.kt`：从 `init()` → 等待 `notifyAudioSessionIdChanged` → 重建 `Equalizer` 绑定
- [ ] `EqualizerPanel`：恢复 5 段滑块、Bass Boost、Virtualizer、LoudnessEnhancer
- [ ] 设备能力探测：保留 `queryAudioEffects`，不支持时降级
- [ ] **错误处理**：设备不支持 EQ 时显示提示而非崩溃
- **验收**：5 段 EQ 真实可听出效果

### 阶段 5：清理（0.5 天）
- [ ] 移除 `react-native-track-player` 依赖（`package.json` + `node_modules`）
- [ ] 删除 `src/service/index.ts`
- [ ] `index.js` 删除 `registerPlaybackService`
- [ ] 全量 `npx tsc --noEmit` + `npm run lint` + `npm run build-android`
- **验收**：零 error，APK 安装运行正常

---

## [P1] 后续可解锁能力（阶段 5 之后评估）

### 听感 FFT 可视化
- Android `Visualizer(audioSessionId, 0)` API
- 数据通过 JSI 推到 RN，Canvas 渲染频谱
- 估时：2-3 天

### 预加载与 Gapless
- Media3 `PreloadMediaSource` + `ConcatenatingMediaSource`
- 切歌延迟 < 100ms
- 估时：1 周

### iOS 端精细音效
- AVAudioEngine 重写（参考 just_audio 的讨论）
- 前提：用户实际需要

---

## [P2] 其他

- [ ] ESLint 55-65 个 warnings 专项清理（与播放内核无关，独立排期）
- [ ] CI exit code 修复（`set -o pipefail`）— 2026-06-02 已部分解决
- [ ] 主题对齐（Shopify 设计稿）— 2026-06-04 已完成
- [ ] 播放页重构（Shopify 风格）— 2026-06-02 已完成

---

## 完成记录

- ✅ 2026-05-29：网络子系统删除
- ✅ 2026-06-02：播放页重构 + 播放无声问题修复
- ✅ 2026-06-03：Shopify 设计稿全页面重构
- ✅ 2026-06-04：主题系统对齐
- ✅ 2026-06-05：音效面板方案 D（临时方案）
- 🆕 2026-06-05：自建 AndroidX 播放内核设计文档完成（草案）
