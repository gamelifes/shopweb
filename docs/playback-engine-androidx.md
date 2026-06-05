# MusicFree 自建 AndroidX 播放内核 — 设计文档

> 状态：草案 v1.0
> 范围：Android 端（Harmony OS 走同一份 Kotlin 代码）
> 不涉及：iOS、Web、跨平台 C++

---

## 0. 决策摘要

| 维度 | 现状（2026-06） | 目标 |
|------|-----------------|------|
| 播放库 | `react-native-track-player` 4.x | **自建** |
| 内核 | KotlinAudio → ExoPlayer（被封装） | **直接 AndroidX Media3** |
| 桥接 | 老式 NativeModule + Promise/Event | **TurboModule (JSI)** |
| 音频会话 ID | ❌ 拿不到（MediaSessionCompat 屏蔽） | ✅ `Player.getAudioSessionId()` |
| 精细 EQ/Bass | ❌ 静默失败（6 月 5 日方案 D） | ✅ 绑定到真实播放流 |
| Harmony OS | 跟随 Android | ✅ 同一份代码 |
| iOS | RNTP 跑 AVQueuePlayer | 暂维持（不重构） |

**为什么值**：方案 A 当时估 3-4 周，跨平台因素是主因。砍掉 iOS 后 **1.5-2 周可落地**。

---

## 1. 关键收益（Why now）

### 1.1 解决历史阻塞点
- **2026-06-05**：`AudioEffectModule.kt` 因为拿不到 `audioSessionId` 被迫走"方案 D"——只做预设切换，砍掉精细滑块
- **自建后**：`Player.getAudioSessionId()` 是 Media3 一等公民，可直接绑 `Equalizer/BassBoost/Virtualizer/LoudnessEnhancer`

### 1.2 解锁新能力
| 能力 | 现状 | 自建后 |
|------|------|--------|
| 5 段 EQ 滑块 | ❌ | ✅ |
| Bass Boost | ❌ | ✅ |
| Virtualizer | ❌ | ✅ |
| Loudness Enhancer | ❌ | ✅ |
| 听感可视化（FFT） | ❌ | ✅（`Visualizer` API） |
| 边下边播预加载 | ⚠️ 半成品 | ✅（`CacheDataSource`） |
| Gapless（无缝切歌） | ❌ | ✅（`ConcatenatingMediaSource` + `PreloadMediaSource`） |
| 多格式（FLAC/Opus/OGG） | 部分 | ✅（系统解码即可） |
| 蓝牙协议细节控制 | 受限 | ✅（`AudioManager.setBluetoothA2dpOn`） |

### 1.3 减少外部依赖
- 移除 `react-native-track-player`（约 1.2MB 编译输出）
- 移除 `KotlinAudio` 间接依赖
- AndroidX Media3 已经是项目基础依赖

---

## 2. 架构总览（三层）

```
┌─────────────────────────────────────────────────────────────┐
│  UI 层（React Native 组件）                                  │
│  src/pages/musicDetail, src/components/musicBar, ...        │
└─────────────────┬───────────────────────────────────────────┘
                  │ 通过 IPlayer 接口
┌─────────────────▼───────────────────────────────────────────┐
│  TS 适配层（src/player/*）                                   │
│  IPlayer 接口、Jotai atoms、PersistStatus 恢复              │
│  ← 不变；只换实现                                            │
└─────────────────┬───────────────────────────────────────────┘
                  │ TurboModule (JSI, 同步)
┌─────────────────▼───────────────────────────────────────────┐
│  原生桥接层（android/.../player/）                            │
│  NativePlayerModule : TurboModule（codegen 生成）           │
└─────────────────┬───────────────────────────────────────────┘
                  │ 内部 API
┌─────────────────▼───────────────────────────────────────────┐
│  引擎核心（android/.../engine/）— 纯 Kotlin，零 RN 依赖      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ PlaybackService : MediaSessionService                │  │
│  │   ├─ ExoPlayer（系统解码 + AudioTrack 输出）         │  │
│  │   ├─ MediaLibrarySession（锁屏 / 通知 / 远程控制）   │  │
│  │   ├─ AudioFocusManager（中断 / 来电 / 闹钟）         │  │
│  │   ├─ AudioEffectPipeline（EQ / Bass / Virt / Loud）  │  │
│  │   ├─ MediaNotificationProvider（通知样式）           │  │
│  │   └─ PlaybackStateMachine（STOPPED/BUFFERING/...）   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**分层原则**：
- **依赖单向**：UI → TS 适配 → 桥接 → 引擎核心
- **引擎核心零外部依赖**：不 import 任何 `com.facebook.react.*` 包，可独立单元测试
- **接口稳定**：UI 层和 TS 适配层不变，只换"实现"——这是开闭原则（OCP）的具体体现

---

## 3. 核心模块划分

### 3.1 引擎核心（`android/.../engine/`）

| 文件 | 职责 | 行数估算 |
|------|------|----------|
| `PlaybackService.kt` | `MediaSessionService` 子类，持有 ExoPlayer + Session 生命周期 | 150 |
| `PlaybackStateMachine.kt` | 状态机：STOPPED/BUFFERING/PLAYING/PAUSED/END/ERROR | 80 |
| `PlayQueue.kt` | 双向队列（upcoming + history + current），支持 insert/replace | 100 |
| `AudioFocusManager.kt` | `AudioManager.requestAudioFocus` + `OnAudioFocusChangeListener` | 80 |
| `AudioEffectPipeline.kt` | 包装 Equalizer/BassBoost/Virtualizer/LoudnessEnhancer | 150 |
| `MediaNotificationProvider.kt` | 自定义通知（参考现有 logoTransparent 图标） | 100 |
| `PlaybackController.kt` | 业务接口：`play/pause/seek/setRate/load/skipToNext` | 120 |
| `PlaybackEvent.kt` | 事件 sealed class | 50 |

### 3.2 桥接层（`android/.../player/`）

| 文件 | 职责 |
|------|------|
| `PlayerModule.kt` | `NativePlayerModuleSpec` 子类（codegen 生成基类） |
| `PlayerPackage.kt` | `ReactPackage` 注册 |

### 3.3 桥接规范（`specs/NativePlayerModule.ts`）

```typescript
// TurboModule 规范文件 — codegen 入口
import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";

export interface Spec extends TurboModule {
    // 生命周期
    setup(maxCacheSize: number): void;
    teardown(): void;

    // 队列
    setQueue(trackIds: string[], startIndex: number): void;
    getCurrentIndex(): number;
    skipToIndex(index: number): void;
    skipToNext(): void;
    skipToPrevious(): void;

    // 播放控制
    play(): void;
    pause(): void;
    stop(): void;
    seek(positionMs: number): void;
    setRate(rate: number): void;
    setVolume(v: number): void;

    // 状态查询
    getPosition(): number;        // 同步，毫秒
    getDuration(): number;
    getState(): string;           // 'idle' | 'buffering' | 'playing' | 'paused' | 'ended'
    getAudioSessionId(): number;  // 关键：解 6 月 5 日阻塞

    // 通知给 JS
    notifyStateChanged(state: string, position: number): void;
    notifyTrackEnded(): void;
    notifyError(code: string, message: string): void;
    notifyAudioSessionIdChanged(sessionId: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>("NativePlayerModule");
```

### 3.4 TS 适配层（`src/player/`）

```
src/player/
├── IPlayer.ts                 # 公共接口（与现有 ITrackPlayer 等价）
├── NativePlayer.ts            # TurboModule 包装（同步调用 + 事件订阅）
├── playerAtom.ts              # Jotai atoms（替换原 trackPlayer 内部 atoms）
├── usePlayer.ts               # React Hook
└── persistStatusBridge.ts     # PersistStatus 字段映射
```

**关键设计**：`IPlayer` 接口保持现状（与 `ITrackPlayer` 同形），`src/core/trackPlayer/index.ts` 仅做内部实现替换，**UI 层零改动**。

---

## 4. 状态机设计

### 4.1 状态枚举

```kotlin
sealed class PlaybackState {
    object Idle : PlaybackState()              // 未加载
    object Buffering : PlaybackState()         // 缓冲中
    data class Ready(val playing: Boolean) : PlaybackState()  // 已就绪
    object Ended : PlaybackState()             // 当前曲结束
    data class Error(val code: String, val msg: String) : PlaybackState()
}
```

### 4.2 转换表

| From | Event | To | 副作用 |
|------|-------|----|--------|
| Idle | load + play | Buffering | start preload |
| Buffering | buffers ready | Ready(playing=true) | start fadeIn |
| Ready(playing) | pause | Ready(playing=false) | release audio focus |
| Ready(playing) | track ended | Ended | notify UI; auto-advance if repeat≠none |
| Ready(playing) | audio focus loss | Ready(playing=false) | persist pause state |
| Any | error | Error | notify + fallback to next |
| Error | reset | Idle | release resources |

**实现要点**：所有跃迁在 `PlaybackStateMachine.transitionTo()` 中走 `synchronized` 锁；非法跃迁抛 `IllegalStateException`，让 bug 立即可见（参考 music player LLD 的 state machine pattern）。

### 4.3 与 ExoPlayer.Player 状态映射

```kotlin
private fun mapExoState(playWhenReady: Boolean, playbackState: Int): PlaybackState = when {
    playbackState == Player.STATE_IDLE -> Idle
    playbackState == Player.STATE_BUFFERING -> Buffering
    playbackState == Player.STATE_READY -> Ready(playWhenReady)
    playbackState == Player.STATE_ENDED -> Ended
    else -> Error("UNKNOWN", "ExoPlayer state: $playbackState")
}
```

---

## 5. 关键流程

### 5.1 启动与状态恢复

```
App 启动
  → bootstrap.ts
    → NativePlayer.setup(maxCacheSize)
      → PlaybackService.onCreate()
        → ExoPlayer.Builder(ctx).build()
        → MediaLibrarySession.Builder(ctx, player, callback).build()
        → AudioFocusManager.requestFocus()
        → AudioEffectPipeline.attach(player.audioSessionId)
        → restoreFromPersistStatus()  // 读 music.queue / music.progress / music.musicItem
  → setupTrackPlayer() 完成
  → 触发 CurrentMusicChanged 事件 → UI 更新
```

### 5.2 播放/暂停（同步，JSI 直调）

```
UI: playButton.onPress
  → player.play()  // TS 适配层
    → NativePlayer.play()  // 同步 JSI 调用
      → PlaybackController.play()
        → player.playWhenReady = true
        → AudioFocusManager.requestFocus()
        → stateMachine.transitionTo(Ready(playing=true))
          → emit(stateChanged)  // 通过 EventEmitter 通知 JS
            → playerAtom.set(...)
              → 所有 useMusicState() 组件 re-render
```

### 5.3 远程控制（锁屏 / 耳机按键）

```
用户按耳机按键
  → Android 框架派发 Intent
    → MediaSession.Callback.onPlay()  // PlaybackService 内
      → PlaybackController.play()  // 与 5.2 同样的内部路径
```

**关键**：`MediaLibrarySession.Callback` 是系统入口，统一路由到 `PlaybackController`，**不需要单独的 `src/service/index.ts`**——这正是自建的价值。

### 5.4 音频中断（来电 / 闹钟）

```
来电
  → AudioFocusManager.onFocusChange(AUDIOFOCUS_LOSS_TRANSIENT)
    → PlaybackController.pause(reason=INTERRUPTION)
      → stateMachine.transitionTo(Ready(playing=false))
      → persistStatus.set("music.wasPlaying", true)
通话结束
  → AudioFocusManager.onFocusChange(AUDIOFOCUS_GAIN)
    → if (persistStatus.get("music.wasPlaying")) PlaybackController.resume()
      → stateMachine.transitionTo(Ready(playing=true))
```

### 5.5 音频效果管线（核心收益点）

```
PlaybackService.onCreate()
  → AudioEffectPipeline.init()
    → equalizer = Equalizer(0, 0)  // 先创建占位
    → bassBoost = BassBoost(0, 0)
    → virtualizer = Virtualizer(0, 0)
    → loudness = LoudnessEnhancer(0, 0)

PlaybackService.onPlayerReady()
  → val sessionId = player.audioSessionId
  → AudioEffectPipeline.attach(sessionId)
    → equalizer.release(); equalizer = Equalizer(sessionId, 0)
    → ... 同上

JS: setBandGain(0, 500)
  → NativePlayer.setBandGain(0, 500)  // 同步
    → AudioEffectPipeline.setBandGain(0, 500)
      → equalizer.setBandLevel((short)bandIdx, (short)gain)
```

**对比现状**：现有 `AudioEffectModule.kt` 走"静默成功"（接受参数但不生效）；自建后真生效。

---

## 6. 数据模型

### 6.1 Track 抽象

```kotlin
data class Track(
    val id: String,                  // 平台 + id 拼接（与现有 IMusic.IMusicItem 同源）
    val title: String,
    val artist: String,
    val album: String?,
    val durationMs: Long,
    val sourceUri: Uri,              // 本地 file:// 或 content://
    val artworkUri: Uri?,
    val lrcUri: Uri? = null,         // 歌词文件（可选）
    val meta: Map<String, String> = emptyMap()
)
```

### 6.2 PersistStatus 字段（保持兼容）

| Key | 类型 | 说明 |
|-----|------|------|
| `music.queue` | `Track[]` | 播放列表（序列化 Track 数组） |
| `music.currentIndex` | `number` | 当前索引 |
| `music.progress` | `number` | 播放位置（秒） |
| `music.rate` | `number` | 播放速率（×100 存整数） |
| `music.repeatMode` | `number` | 0/1/2 = QUEUE/SHUFFLE/SINGLE |
| `music.quality` | `string` | 音质 key |

**新字段**：
- `player.audioSessionId` — 启动时缓存，给 `AudioEffectPanel` 兜底
- `player.pipelineAttached` — boolean，标记音效管线是否绑定

---

## 7. 平台实现细节

### 7.1 AndroidManifest.xml 变更

```xml
<!-- 删除：KotlinAudio 自带的 MusicService（自动注册，无需手写） -->

<!-- 新增：自建 PlaybackService -->
<service
    android:name=".engine.PlaybackService"
    android:foregroundServiceType="mediaPlayback"
    android:exported="true">
    <intent-filter>
        <action android:name="androidx.media3.session.MediaSessionService" />
    </intent-filter>
</service>

<!-- 权限（已存在则无需重复） -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
<uses-permission android:name="android.permission.MEDIA_CONTENT_CONTROL" />
```

### 7.2 依赖（`android/app/build.gradle`）

```gradle
dependencies {
    // 删除：KotlinAudio（随 RNTP 间接依赖，移除 RNTP 后自动消失）

    // 新增：AndroidX Media3
    implementation "androidx.media3:media3-exoplayer:1.4.1"
    implementation "androidx.media3:media3-session:1.4.1"
    implementation "androidx.media3:media3-datasource:1.4.1"     // ContentDataSource 处理 content:// URI
    // 可选：可视化、可流式 HLS（本地用不到）
    // implementation "androidx.media3:media3-ui:1.4.1"
    // implementation "androidx.media3:media3-exoplayer-hls:1.4.1"
}
```

### 7.3 MainApplication.kt 变更

```kotlin
// 删除：无（KotlinAudio 不需要 Package 注册）
// 新增：
override fun getPackages(): List<ReactPackage> = PackageList(this).packages.apply {
    add(UtilsPackage())
    add(Mp3UtilPackage())
    add(LyricUtilPackage())
    add(AudioEffectPackage())    // 保留（音效面板 UI）
    add(PlayerPackage())          // 新增（自建内核）
}
```

### 7.4 index.js 变更

```javascript
// 删除
import TrackPlayer from "react-native-track-player";
TrackPlayer.registerPlaybackService(() => require("./src/service/index"));

// 删除整个 src/service/index.ts 文件
```

---

## 8. 桥接层代码骨架

### 8.1 Kotlin 模块实现

```kotlin
package fun.upup.musicfree.player

import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = NativePlayerModule.NAME)
class NativePlayerModule(reactContext: ReactApplicationContext) :
    NativePlayerModuleSpec(reactContext) {

    companion object {
        const val NAME = "NativePlayerModule"
    }

    private val engine: PlaybackService get() = PlaybackServiceHolder.get()

    override fun getName() = NAME

    // === 同步方法（TurboModule 支持同步 JSI 调用）===

    override fun setup(maxCacheSize: Double) {
        engine.setup(maxCacheSize.toLong())
    }

    override fun play() = engine.play()
    override fun pause() = engine.pause()
    override fun stop() = engine.stop()
    override fun seek(positionMs: Double) = engine.seek(positionMs.toLong())
    override fun setRate(rate: Double) = engine.setRate(rate.toFloat())
    override fun setVolume(v: Double) = engine.setVolume(v.toFloat())

    override fun getPosition(): Double = engine.positionMs.toDouble()
    override fun getDuration(): Double = engine.durationMs.toDouble()
    override fun getState(): String = engine.state.name
    override fun getAudioSessionId(): Double = engine.audioSessionId.toDouble()

    // === 事件发往 JS（通过 EventEmitter）===
    // 由 PlaybackService 在状态变化时调用
    fun emitStateChanged(state: String, position: Long) {
        // 构造 JSI Map 并 emit
    }
}
```

### 8.2 关键 JSI 事件桥

```kotlin
// 在 PlaybackService.StateListener 中
override fun onPlaybackStateChanged(playWhenReady: Boolean, playbackState: Int) {
    val newState = mapExoState(playWhenReady, playbackState)
    if (newState != stateMachine.current) {
        stateMachine.transitionTo(newState)
        // 通知 RN 层
        val ctx = reactContext ?: return
        val payload = Arguments.createMap().apply {
            putString("state", newState.name)
            putDouble("position", positionMs.toDouble())
        }
        ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("PlayerStateChanged", payload)
    }
}
```

---

## 9. TS 适配层代码骨架

### 9.1 `src/player/NativePlayer.ts`

```typescript
import { EventEmitter } from "eventemitter3";
import NativePlayerModule from "../../specs/NativePlayerModule";

type PlayerEvent =
    | { type: "stateChanged"; state: string; position: number }
    | { type: "trackEnded" }
    | { type: "error"; code: string; message: string }
    | { type: "audioSessionIdChanged"; sessionId: number };

class NativePlayer extends EventEmitter<Record<string, (e: PlayerEvent) => void>> {
    play() { NativePlayerModule.play(); }
    pause() { NativePlayerModule.pause(); }
    seek(ms: number) { NativePlayerModule.seek(ms); }
    setRate(r: number) { NativePlayerModule.setRate(r); }
    setVolume(v: number) { NativePlayerModule.setVolume(v); }
    getState() { return NativePlayerModule.getState() as PlayerState; }
    getPosition() { return NativePlayerModule.getPosition(); }
    getAudioSessionId() { return NativePlayerModule.getAudioSessionId(); }

    // 桥接原生事件到 EventEmitter
    init() {
        const sub = new NativeEventEmitter();
        sub.addListener("PlayerStateChanged", e =>
            this.emit("stateChanged", { type: "stateChanged", ...e }));
        sub.addListener("PlayerTrackEnded", () =>
            this.emit("trackEnded", { type: "trackEnded" }));
        // ... error / sessionId
    }
}

export default new NativePlayer();
```

### 9.2 `src/player/IPlayer.ts`（与现有 ITrackPlayer 等价）

```typescript
export interface IPlayer {
    play(item?: IMusic.IMusicItem | null, forcePlay?: boolean): Promise<void>;
    pause(): Promise<void>;
    seekTo(position: number): Promise<void>;
    setRate(rate: number): Promise<void>;
    skipToNext(): Promise<void>;
    skipToPrevious(): Promise<void>;
    add(music: IMusic.IMusicItem | IMusic.IMusicItem[]): void;
    remove(music: IMusic.IMusicItem): Promise<void>;
    getProgress(): Promise<{ position: number; duration: number }>;
    // ... 其余方法与 ITrackPlayer 同
}
```

### 9.3 `src/core/trackPlayer/index.ts` 改造要点

```typescript
// 旧
import ReactNativeTrackPlayer, { Event } from "react-native-track-player";
ReactNativeTrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, ...);

// 新
import NativePlayer from "@/player/NativePlayer";
NativePlayer.on("stateChanged", ({ state, position }) => { ... });
```

**改造原则**：所有 799 行业务逻辑（队列管理、repeat 模式、currentMusic 计算）**保留不变**，仅把 RNTP 调用换成 `NativePlayer` 调用。

---

## 10. UI 消费点（影响面）

经扫描，引用 `react-native-track-player` 的文件共 7 处：

| 文件 | 改动 |
|------|------|
| `src/core/trackPlayer/index.ts` | 替换 RNTP API → `NativePlayer` API |
| `src/service/index.ts` | **删除**（功能由 `PlaybackService` 接管） |
| `src/entry/bootstrap/bootstrap.ts` | `RNTrackPlayer.setupPlayer/updateOptions` → `NativePlayer.setup` |
| `src/core/lyricManager.ts` | `Event.PlaybackProgressUpdated` → `NativePlayer.on("positionChanged", ...)` |
| `src/utils/trackUtils.ts` | `State` 枚举 → 自定义 `PlayerState` 字符串 |
| `src/types/core/trackPlayer/index.d.ts` | `Progress` 类型 → 自定义 `IPlayerProgress` |
| `src/components/panels/types/audioEffect.tsx` | 文案："react-native-track-player 无法..." → 改为"已绑定音频会话 ID" |

UI 组件层（`useMusicState / useCurrentMusic / usePlayList / useProgress`）**零改动**——它们消费的是 Jotai atoms，atoms 由 `trackPlayer` 内部 set，路径不变。

---

## 11. 渐进迁移策略（5 阶段，1.5-2 周）

### 阶段 0：脚手架（0.5 天）✅ 已完成（2026-06-05）

**重要调整（Old Architecture 路径）**：

项目当前 `newArchEnabled=false`（见 `android/gradle.properties`），沿用 Old Architecture（Bridge）。
所有现有 module（UtilsPackage / Mp3UtilPackage / LyricUtilPackage / AudioEffectPackage）均为老式 `ReactContextBaseJavaModule`。

**脚手架与原计划的差异**：
- ❌ **不**写 `specs/NativePlayerModule.ts`（TurboModule spec，需 New Arch + codegen）
- ❌ **不**开 `newArchEnabled=true`（触发项目级 RNTP/Expo/RN 兼容性重测）
- ❌ **不**生成 `NativePlayerModuleSpec.kt`（codegen 产物）
- ✅ **沿用 Old Arch 风格**：`PlayerModule : ReactContextBaseJavaModule` + `PlayerPackage : ReactPackage`
- ✅ **零代码逻辑**：仅 `ping()` 一个方法，验证桥通即可
- ✅ **零破坏**：原 RNTP 完全不感知

**已完成清单**：
- ✅ `android/app/src/main/java/fun/upup/musicfree/player/PlayerModule.kt`（38 行，骨架）
- ✅ `android/app/src/main/java/fun/upup/musicfree/player/PlayerPackage.kt`（22 行，与 AudioEffectPackage 风格一致）
- ✅ `MainApplication.kt` 注册 `add(PlayerPackage())`
- ✅ `src/player/NativePlayer.ts`（48 行，TS 包装 + 容错降级）
- ✅ `npx tsc --noEmit` 通过
- ✅ `npm run lint` 通过

**验证约束**：
- 本地无 Android SDK（开发机），无法跑 `gradlew compileDebugKotlin`
- 验证依赖 GitHub Actions 的 `build-beta` workflow（`dev` 分支推送触发）
- 风险评估：脚手架完全是照抄 AudioEffectPackage 模式，代码风险<5%

**阶段 3 替换时是否迁 New Arch**：
- 选项 A：继续走 Old Arch（与 RNTP 共存）
- 选项 B：统一迁 New Arch（TurboModule 范式，删除 RNTP 强依赖）
- 决策点放在阶段 3 入口处评估，不在阶段 0 提前投入

此时 RN 端不调任何方法，原 RNTP 仍工作。

### 阶段 1：引擎核心 Kotlin（4-5 天）
- `PlaybackService.kt` 骨架：onCreate / onGetSession / onDestroy
- `PlaybackController.kt` 业务方法
- `PlayQueue.kt` 双向队列
- `PlaybackStateMachine.kt`
- `AudioFocusManager.kt`
- 单元测试：状态机跃迁表

### 阶段 2：桥接层（2-3 天）
- `NativePlayerModule.kt` 实现所有 spec 方法
- 事件通过 `RCTDeviceEventEmitter` 推到 JS
- `NativePlayer.ts` 包装 + EventEmitter
- 端到端测试：JS 调用 play → 原生执行 → 事件回传

### 阶段 3：替换 RNTP（2-3 天）
- 修改 `src/core/trackPlayer/index.ts` 7 处调用
- 修改 `bootstrap.ts` 初始化流程
- 修改 `lyricManager.ts` 进度事件
- **保留 RNTP 依赖但不调用**——fallback 路径
- UI 端逐场景测试

### 阶段 4：音频效果管线（1-2 天，**核心收益**）
- 改造 `AudioEffectModule.kt`：从 `init()` 拿 sessionId → 等待 `notifyAudioSessionIdChanged` → 重新构造 `Equalizer` 绑定
- 重做 `EqualizerPanel`：恢复 5 段滑块、Bass Boost、Virtualizer、LoudnessEnhancer
- 设备能力探测：保留 `queryAudioEffects` 探测，不支持时降级到预设切换（兼容方案 D）

### 阶段 5：清理（0.5 天）
- 移除 `react-native-track-player` 依赖
- 移除 `src/service/index.ts`
- 删除 `node_modules` 重新装
- 全量回归测试

---

## 12. 关键风险与缓解

| 风险 | 等级 | 缓解 |
|------|------|------|
| ExoPlayer 1.4.x 与 Kotlin 1.9 兼容 | 🟡 | 在阶段 0 验证，CI 跑一次 `assembleRelease` |
| MediaSession ID 冲突崩溃（issue #2485） | 🔴 | 启动时 `setId("MusicFree_${System.currentTimeMillis()}")` 唯一化 |
| 蓝牙协议切换音质变差 | 🟡 | `AudioFocusManager` 增加 BT focus 处理 |
| 通知样式不匹配设计稿 | 🟢 | 复用 `ImgAsset.logoTransparent` |
| Foreground service 启动 ANR | 🟡 | 用 `Service.startForeground()` 异步调用，配 5s timeout |
| Harmony OS 兼容性 | 🟡 | 阶段 1 末跑一次 Harmony 构建，差异点记录到 `errors.md` |
| 已删除的网络层（`pluginManager`）不能再作为音源 | 🟢 | 现状：本地播放，与 Media3 DataSource 范围一致 |

---

## 13. 验收标准

### 13.1 功能回归
- [ ] 启动恢复：上次播放列表 / 位置 / 模式 / 速率全部还原
- [ ] 基础操作：play / pause / seek / skip / 模式切换正常
- [ ] 后台播放：锁屏 / 切到其他 app 仍播放，进程不杀
- [ ] 远程控制：耳机按键、通知中心、锁屏卡片可用
- [ ] 歌词同步：进度准确
- [ ] 来电暂停 / 通话结束自动续播

### 13.2 新能力（核心收益）
- [ ] 5 段 EQ 滑块生效（音频可听出变化）
- [ ] Bass Boost / Virtualizer / LoudnessEnhancer 真实生效
- [ ] 听感 FFT 可视化（可选，阶段 4 后）

### 13.3 质量
- [ ] `npx tsc --noEmit` 0 error
- [ ] `npm run lint` 0 error（warnings 不增）
- [ ] `npm run build-android` 成功
- [ ] APK 冷启动 < 3s
- [ ] 播放 1h 后内存 < 200MB
- [ ] 引擎核心 Kotlin 代码单测覆盖率 > 70%

---

## 14. 参考文献（成熟方案）

### 官方文档
- AndroidX Media3 ExoPlayer：https://developer.android.com/reference/androidx/media3/exoplayer/ExoPlayer
- MediaSessionService 后台播放：https://developer.android.com/media/media3/session/background-playback
- AndroidX Media GitHub：https://github.com/androidx/media

### 借鉴的代码仓库
- **react-native-track-player**（逆向参考）：https://github.com/doublesymmetry/react-native-track-player
- **KotlinAudio**（其内部 ExoPlayer 封装）：https://github.com/doublesymmetry/KotlinAudio
- **just_audio**（Flutter 音乐播放器，状态机 + Strategy）：https://github.com/ryanheise/just_audio
- **MPV**（属性观察模式 + 插件系统）：https://github.com/mpv-player/mpv

### 设计模式参考
- 音乐播放器 LLD（Strategy + Observer + State Machine）：https://ikshitij.com/learn/lld-object-oriented/music-player-lld/
- Auralis（Clean Architecture for music player）：https://github.com/matiaszanolli/Auralis

### 内部历史
- `L_Knowledge/sessions/2026-06-05-audioeffect-plan-d.md`（方案 D 失败根因）
- `L_Knowledge/sessions/2026-06-02-musicfree-playback-redesign-complete.md`（playWithReplacePlayList 链路）
- `L_Knowledge/sessions/2026-05-29-musicfree-network-removal`（已删 network）

---

## 15. 附录：与方案 A 估时的差异

| 项 | 方案 A（3-4 周） | 本方案（1.5-2 周） |
|----|------------------|---------------------|
| 跨平台抽象 | 占 1 周 | ❌ 砍 |
| iOS 实现 / 迁移 | 占 1.5 周 | ❌ 砍 |
| C++ 共享层 | 占 0.5 周 | ❌ 砍 |
| 自建引擎 | 1 周 | 1 周（仅 Android） |
| 桥接层 | 0.5 周 | 0.5 周 |
| 回归测试 | 0.5 周 | 0.5 周 |

节省的 1.5-2 周 = 砍掉 iOS + C++ 跨平台复杂度。

---

*草案 v1.0 — 待 review*
