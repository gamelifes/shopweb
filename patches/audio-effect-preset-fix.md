# 原生模块 AudioEffectModule 修复补丁

## 问题
- setPreset 异常被静默吞掉，预设应用失败无反馈
- 预设索引越界时 JS 无法感知
- 所有 native 方法异常应传递到 JS

## 修复内容

### 1. setPreset 方法改为返回 Promise

原代码（line 147-152）：
```kotlin
@ReactMethod
fun setPreset(presetIndex: Int) {
    try {
        equalizer?.usePreset(presetIndex.toShort())
    } catch (_: Exception) { }
}
```

修复后：
```kotlin
@ReactMethod
fun setPreset(presetIndex: Int, promise: Promise) {
    try {
        val eq = equalizer
        if (eq == null) {
            promise.reject("PRESET_ERROR", "Equalizer not initialized")
            return
        }
        val numPresets = eq.numberOfPresets
        if (presetIndex < 0 || presetIndex >= numPresets) {
            promise.reject("PRESET_ERROR", "Invalid preset index: $presetIndex, available: 0-${numPresets-1}")
            return
        }
        eq.usePreset(presetIndex.toShort())
        promise.resolve(true)  // 成功
    } catch (e: Exception) {
        promise.reject("PRESET_ERROR", e.message ?: "Failed to set preset")
    }
}
```

### 2. 其他方法也应避免静默异常（可选）

例如 `setBandGain` 当前也吞掉异常。建议至少传递错误到 JS：

```kotlin
@ReactMethod
fun setBandGain(band: Int, millibels: Int, promise: Promise) {
    try {
        val eq = equalizer
        if (eq == null) {
            promise.reject("EQ_ERROR", "Equalizer not initialized")
            return
        }
        val numBands = eq.numberOfBands
        if (band < 0 || band >= numBands) {
            promise.reject("EQ_ERROR", "Invalid band index: $band, available: 0-${numBands-1}")
            return
        }
        eq.setBandLevel(band.toShort(), millibels.toShort())
        promise.resolve(null)
    } catch (e: Exception) {
        promise.reject("EQ_ERROR", e.message ?: "Failed to set band gain")
    }
}
```

### 3. 更新 TypeScript 调用

在 `audioEffect.tsx` 的 `selectPreset` 中，现在需要处理可能的错误：

```typescript
const selectPreset = async (idx: number) => {
    try {
        await AudioEffectNative.setPreset(idx); // 现在返回 Promise
        // 重新读取该预设的所有参数
        const numBands = await AudioEffectNative.getNumberOfBands();
        const gains: number[] = [];
        for (let i = 0; i < numBands; i++) {
            gains.push(await AudioEffectNative.getBandGain(i));
        }
        const bass = await AudioEffectNative.getBassBoostStrength();
        const virt = await AudioEffectNative.getVirtualizerStrength();
        const loud = await AudioEffectNative.getLoudnessGain();
        setEqState(prev => ({
            ...prev,
            currentPreset: idx,
            bandGains: gains,
            bassBoost: bass,
            virtualizer: virt,
            loudness: loud,
        }));
    } catch (e) {
        console.warn(`setPreset(${idx}) failed:`, e);
        Toast.error(`预设应用失败: ${e.message}`);
    }
};
```

### 4. 在 initEffect 中添加更多日志（调试用）

```typescript
const initEffect = async () => {
    try {
        setLoading(true);
        await AudioEffectNative.init();

        const range = await AudioEffectNative.getBandLevelRange();
        setBandRange(range);

        const names = await AudioEffectNative.getPresetNames();
        const numBands = await AudioEffectNative.getNumberOfBands();
        console.log(`[AudioEffect] Init: numBands=${numBands}, presetNames=${names?.join(',')}`);

        const freqs: number[] = [];
        const gains: number[] = [];
        for (let i = 0; i < numBands; i++) {
            const freq = await AudioEffectNative.getCenterFreq(i);
            const gain = await AudioEffectNative.getBandGain(i);
            freqs.push(freq);
            gains.push(gain);
            console.log(`[AudioEffect] Band ${i}: freq=${freq}Hz, gain=${gain}`);
        }

        // ... 其余代码
    } catch (e) {
        console.error("[AudioEffect] init failed:", e);
        Toast.error(`音效初始化失败: ${e.message}`);
    } finally {
        setLoading(false);
    }
};
```

### 5. 验证预设数量并限制 UI

在 React 端，使用实际预设数量限制渲染：

```typescript
const effectivePresetCount = Math.min(eqState.presetNames.length || 8, 8);
const displayPresets = (eqState.presetNames.length > 0 ? eqState.presetNames : PRESET_LABELS).slice(0, effectivePresetCount);
```

## 影响范围
- 需要修改原生模块 `AudioEffectModule.kt`
- 需要修改 TypeScript `audioEffect.tsx` 的 `selectPreset` 错误处理
- 可选：添加日志和用户提示

## 预期效果
- 预设索引越界时会抛出明确错误
- 初始化失败可被感知
- 用户操作后如果失败会看到提示
- 通过日志可精确定位问题
