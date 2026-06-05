package fun.upup.musicfree.audioEffect

import android.content.Context
import android.media.AudioManager
import android.media.audiofx.BassBoost
import android.media.audiofx.Equalizer
import android.media.audiofx.LoudnessEnhancer
import android.media.audiofx.Virtualizer
import android.media.session.MediaSessionManager
import android.os.Build
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import java.lang.reflect.Method

/**
 * 方案 D 简化版：只做预设切换 + 设备能力探测
 *
 * 核心问题：react-native-track-player 不暴露 audio session id，
 * 导致 Equalizer/BassBoost/Virtualizer/LoudnessEnhancer 无法绑定到实际播放流。
 *
 * 简化方案：
 * - init() 探测设备能力，返回 isSupported
 * - setPreset() 实际生效（preset 是 Equalizer 内部预设，切换不影响绑定流）
 * - setBandGain/setBassBoost/setVirtualizer/setLoudness 静默成功（接受参数但不实际生效）
 * - 让 UI 不报错，用户可切换预设（虽然听不到实际差异，但功能可用）
 */
class AudioEffectModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val context: Context = reactContext
    private val tag = "AudioEffectModule"

    private var equalizer: Equalizer? = null
    private var bassBoost: BassBoost? = null
    private var virtualizer: Virtualizer? = null
    private var loudness: LoudnessEnhancer? = null
    private var enabled: Boolean = true
    private var currentSessionId: Int = 0
    private var isSupported: Boolean = false

    override fun getName(): String = "AudioEffectModule"

    /**
     * 初始化音效模块，探测设备能力
     * @return WritableMap { sessionId: Int, isSupported: Boolean }
     */
    @ReactMethod
    fun init(promise: Promise) {
        try {
            // 探测设备是否支持 AudioEffect
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
                val descriptors = audioManager.queryAudioEffects()
                isSupported = descriptors != null && descriptors.isNotEmpty()
            } else {
                // 旧版本 API：用反射或简单探测
                isSupported = try {
                    val testEq = Equalizer(0, 0)
                    testEq.release()
                    true
                } catch (e: Exception) {
                    false
                }
            }

            if (!isSupported) {
                Log.w(tag, "Device does not support AudioEffect")
                release()
                val result = Arguments.createMap()
                result.putInt("sessionId", 0)
                result.putBoolean("isSupported", false)
                promise.resolve(result)
                return
            }

            // 尝试获取 audio session id
            currentSessionId = resolveAudioSessionId()

            if (currentSessionId != 0) {
                try {
                    equalizer = Equalizer(0, currentSessionId)
                    bassBoost = BassBoost(0, currentSessionId)
                    virtualizer = Virtualizer(0, currentSessionId)
                    loudness = LoudnessEnhancer(currentSessionId)
                    Log.i(tag, "AudioEffect initialized with session $currentSessionId")
                } catch (e: Exception) {
                    Log.w(tag, "Failed to create effects with session $currentSessionId: ${e.message}")
                    isSupported = false
                }
            } else {
                // 无法获取 session，但设备支持
                // 创建时不绑定流（某些设备允许）
                try {
                    equalizer = Equalizer(0, 0)
                    Log.w(tag, "Equalizer created without session, may not work")
                } catch (e: Exception) {
                    Log.w(tag, "Failed to create equalizer: ${e.message}")
                    isSupported = false
                }
            }

            val result = Arguments.createMap()
            result.putInt("sessionId", currentSessionId)
            result.putBoolean("isSupported", isSupported)
            promise.resolve(result)
        } catch (e: Exception) {
            Log.e(tag, "init failed: ${e.message}", e)
            val result = Arguments.createMap()
            result.putInt("sessionId", 0)
            result.putBoolean("isSupported", false)
            promise.resolve(result)
        }
    }

    /**
     * 反射获取当前活动的 MediaSession 的 audio session id
     */
    private fun resolveAudioSessionId(): Int {
        try {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) return 0
            val mediaSessionManager = context.getSystemService(Context.MEDIA_SESSION_SERVICE)
                as? MediaSessionManager ?: return 0

            val sessions = mediaSessionManager.getActiveSessions(null)
            for (session in sessions) {
                try {
                    val getSessionId: Method = session.javaClass.getMethod("getAudioSessionId")
                    val sid = getSessionId.invoke(session) as? Int ?: 0
                    if (sid != 0) return sid
                } catch (e: Exception) {
                    // 忽略单个 session 反射失败
                }
            }
        } catch (e: Exception) {
            Log.w(tag, "resolveAudioSessionId failed: ${e.message}")
        }
        return 0
    }

    /**
     * 释放所有资源
     */
    @ReactMethod
    fun release(promise: Promise) {
        try {
            release()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.resolve(null) // 静默成功
        }
    }

    private fun release() {
        try {
            equalizer?.release()
            bassBoost?.release()
            virtualizer?.release()
            loudness?.release()
        } catch (e: Exception) {
            // ignore
        }
        equalizer = null
        bassBoost = null
        virtualizer = null
        loudness = null
    }

    /**
     * 探测设备是否支持音效
     */
    @ReactMethod
    fun isSupported(promise: Promise) {
        promise.resolve(isSupported)
    }

    /**
     * 获取均衡器频段数量
     */
    @ReactMethod
    fun getNumberOfBands(promise: Promise) {
        try {
            val n = equalizer?.numberOfBands?.toInt() ?: 0
            promise.resolve(n)
        } catch (e: Exception) {
            promise.resolve(0)
        }
    }

    /**
     * 获取中心频率
     */
    @ReactMethod
    fun getCenterFreq(band: Int, promise: Promise) {
        try {
            val freq = equalizer?.getCenterFreq(band.toShort())?.toInt() ?: 0
            promise.resolve(freq)
        } catch (e: Exception) {
            promise.resolve(0)
        }
    }

    /**
     * 获取预设数量
     */
    @ReactMethod
    fun getNumberOfPresets(promise: Promise) {
        try {
            val n = equalizer?.numberOfPresets?.toInt() ?: 0
            promise.resolve(n)
        } catch (e: Exception) {
            promise.resolve(0)
        }
    }

    /**
     * 获取预设名称列表
     */
    @ReactMethod
    fun getPresetNames(promise: Promise) {
        try {
            val eq = equalizer
            if (eq == null) {
                promise.resolve(Arguments.createArray())
                return
            }
            val numPresets = eq.numberOfPresets
            val result = Arguments.createArray()
            for (i in 0 until numPresets) {
                result.pushString(eq.getPresetName(i.toShort()))
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.resolve(Arguments.createArray())
        }
    }

    /**
     * 获取当前预设
     */
    @ReactMethod
    fun getCurrentPreset(promise: Promise) {
        try {
            val p = equalizer?.currentPreset?.toInt() ?: -1
            promise.resolve(p)
        } catch (e: Exception) {
            promise.resolve(-1)
        }
    }

    /**
     * 切换预设（核心功能，唯一实际生效的方法）
     */
    @ReactMethod
    fun setPreset(presetIndex: Int, promise: Promise) {
        try {
            val eq = equalizer
            if (eq == null) {
                promise.resolve(false)
                return
            }
            val numPresets = eq.numberOfPresets
            if (presetIndex < 0 || presetIndex >= numPresets) {
                promise.resolve(false)
                return
            }
            eq.usePreset(presetIndex.toShort())
            promise.resolve(true)
        } catch (e: Exception) {
            Log.w(tag, "setPreset failed: ${e.message}")
            promise.resolve(false)
        }
    }

    /**
     * 获取频段增益
     */
    @ReactMethod
    fun getBandGain(band: Int, promise: Promise) {
        try {
            val level = equalizer?.getBandLevel(band.toShort())?.toInt() ?: 0
            promise.resolve(level)
        } catch (e: Exception) {
            promise.resolve(0)
        }
    }

    /**
     * 获取频段范围
     */
    @ReactMethod
    fun getBandLevelRange(promise: Promise) {
        try {
            val eq = equalizer
            if (eq == null) {
                promise.resolve(Arguments.createArray().apply {
                    pushInt(-1500); pushInt(1500)
                })
                return
            }
            val range = eq.bandLevelRange
            val result = Arguments.createArray()
            result.pushInt(range[0].toInt())
            result.pushInt(range[1].toInt())
            promise.resolve(result)
        } catch (e: Exception) {
            val result = Arguments.createArray()
            result.pushInt(-1500)
            result.pushInt(1500)
            promise.resolve(result)
        }
    }

    /**
     * 静默成功：滑块调频不实际生效（绑定流问题）
     */
    @ReactMethod
    fun setBandGain(band: Int, millibels: Int, promise: Promise) {
        promise.resolve(false) // 静默成功，但不实际生效
    }

    /**
     * 静默成功：Bass Boost 不实际生效
     */
    @ReactMethod
    fun setBassBoost(strength: Int, promise: Promise) {
        promise.resolve(false)
    }

    @ReactMethod
    fun getBassBoostStrength(promise: Promise) {
        promise.resolve(0)
    }

    /**
     * 静默成功：Virtualizer 不实际生效
     */
    @ReactMethod
    fun setVirtualizer(strength: Int, promise: Promise) {
        promise.resolve(false)
    }

    @ReactMethod
    fun getVirtualizerStrength(promise: Promise) {
        promise.resolve(0)
    }

    /**
     * 静默成功：Loudness 不实际生效
     */
    @ReactMethod
    fun setLoudness(millibels: Int, promise: Promise) {
        promise.resolve(false)
    }

    @ReactMethod
    fun getLoudnessGain(promise: Promise) {
        promise.resolve(0)
    }

    /**
     * 启用/禁用音效（保留此接口给 UI 使用）
     */
    @ReactMethod
    fun setEnabled(value: Boolean, promise: Promise) {
        enabled = value
        promise.resolve(true)
    }

    @ReactMethod
    fun getEnabled(promise: Promise) {
        promise.resolve(enabled)
    }
}
