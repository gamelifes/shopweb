package `fun`.upup.musicfree.audioEffect

import android.content.Context
import android.media.audiofx.BassBoost
import android.media.audiofx.Equalizer
import android.media.audiofx.LoudnessEnhancer
import android.media.audiofx.Virtualizer
import android.media.session.MediaSessionManager
import android.os.Build
import com.facebook.react.bridge.*

class AudioEffectModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {

    private val reactContext: ReactApplicationContext = context
    private var equalizer: Equalizer? = null
    private var bassBoost: BassBoost? = null
    private var virtualizer: Virtualizer? = null
    private var loudnessEnhancer: LoudnessEnhancer? = null
    private var currentSessionId: Int = 0
    private var initialized: Boolean = false
    private var bassBoostStrength: Short = 0
    private var virtualizerStrength: Short = 0

    override fun getName() = "AudioEffectModule"

    @ReactMethod
    fun init(promise: Promise) {
        try {
            release()
            currentSessionId = resolveAudioSessionId()

            equalizer = Equalizer(0, currentSessionId).apply {
                enabled = true
            }
            bassBoost = BassBoost(0, currentSessionId).apply {
                enabled = true
            }
            virtualizer = Virtualizer(0, currentSessionId).apply {
                enabled = true
            }
            loudnessEnhancer = LoudnessEnhancer(currentSessionId).apply {
                enabled = true
            }

            initialized = true
            promise.resolve(currentSessionId)
        } catch (e: Exception) {
            promise.reject("AUDIO_EFFECT_INIT_ERROR", e.message ?: "Unknown error")
        }
    }

    @ReactMethod
    fun release() {
        equalizer?.let {
            it.enabled = false
            it.release()
        }
        bassBoost?.let {
            it.enabled = false
            it.release()
        }
        virtualizer?.let {
            it.enabled = false
            it.release()
        }
        loudnessEnhancer?.let {
            it.enabled = false
            it.release()
        }
        equalizer = null
        bassBoost = null
        virtualizer = null
        loudnessEnhancer = null
        initialized = false
    }

    // ===== Equalizer =====

    @ReactMethod
    fun getNumberOfBands(promise: Promise) {
        try {
            promise.resolve((equalizer?.numberOfBands ?: 0).toInt())
        } catch (e: Exception) {
            promise.reject("EQ_ERROR", e.message)
        }
    }

    @ReactMethod
    fun getBandLevelRange(promise: Promise) {
        try {
            val range = equalizer?.bandLevelRange ?: shortArrayOf(-1500, 1500)
            val result = Arguments.createArray()
            result.pushInt(range[0].toInt())
            result.pushInt(range[1].toInt())
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("EQ_ERROR", e.message)
        }
    }

    @ReactMethod
    fun getCenterFreq(band: Int, promise: Promise) {
        try {
            val freq = equalizer?.getCenterFreq(band.toShort()) ?: 0
            promise.resolve(freq.toInt())
        } catch (e: Exception) {
            promise.reject("EQ_ERROR", e.message)
        }
    }

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

    @ReactMethod
    fun getBandGain(band: Int, promise: Promise) {
        try {
            val level = equalizer?.getBandLevel(band.toShort()) ?: 0
            promise.resolve(level.toInt())
        } catch (e: Exception) {
            promise.reject("EQ_ERROR", e.message)
        }
    }

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
            promise.reject("EQ_ERROR", e.message)
        }
    }

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
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("PRESET_ERROR", e.message ?: "Failed to set preset")
        }
    }

    @ReactMethod
    fun getCurrentPreset(promise: Promise) {
        try {
            promise.resolve((equalizer?.currentPreset ?: 0).toInt())
        } catch (e: Exception) {
            promise.reject("EQ_ERROR", e.message)
        }
    }

    // ===== BassBoost =====

    @ReactMethod
    fun setBassBoost(strength: Int) {
        try {
            bassBoostStrength = strength.toShort()
            bassBoost?.setStrength(bassBoostStrength)
        } catch (_: Exception) { }
    }

    @ReactMethod
    fun getBassBoostStrength(promise: Promise) {
        promise.resolve(bassBoostStrength.toInt())
    }

    @ReactMethod
    fun isBassBoostSupported(promise: Promise) {
        promise.resolve(true) // BassBoost supported on all modern Android
    }

    // ===== Virtualizer =====

    @ReactMethod
    fun setVirtualizer(strength: Int) {
        try {
            virtualizerStrength = strength.toShort()
            virtualizer?.setStrength(virtualizerStrength)
        } catch (_: Exception) { }
    }

    @ReactMethod
    fun getVirtualizerStrength(promise: Promise) {
        promise.resolve(virtualizerStrength.toInt())
    }

    @ReactMethod
    fun isVirtualizerSupported(promise: Promise) {
        promise.resolve(true) // Virtualizer supported on all modern Android
    }

    // ===== LoudnessEnhancer =====

    @ReactMethod
    fun setLoudness(gainMillibels: Int) {
        try {
            loudnessEnhancer?.setTargetGain(gainMillibels)
        } catch (_: Exception) { }
    }

    @ReactMethod
    fun getLoudnessGain(promise: Promise) {
        try {
            promise.resolve(loudnessEnhancer?.getTargetGain() ?: 0)
        } catch (e: Exception) {
            promise.reject("LOUD_ERROR", e.message)
        }
    }

    @ReactMethod
    fun isLoudnessSupported(promise: Promise) {
        promise.resolve(true) // LoudnessEnhancer supported on all modern Android
    }

    // ===== Session Management =====

    @ReactMethod
    fun setEnabled(enabled: Boolean) {
        try {
            equalizer?.enabled = enabled
            bassBoost?.enabled = enabled
            virtualizer?.enabled = enabled
            loudnessEnhancer?.enabled = enabled
        } catch (_: Exception) { }
    }

    @ReactMethod
    fun getAudioSessionId(promise: Promise) {
        promise.resolve(currentSessionId)
    }

    // ===== Internal =====

    private fun resolveAudioSessionId(): Int {
        // Priority 1: Find active media session's audio session ID
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            try {
                val sessionManager = reactContext.getSystemService(Context.MEDIA_SESSION_SERVICE) as MediaSessionManager
                val activeSessions = sessionManager.getActiveSessions(null)
                for (controller in activeSessions) {
                    val playbackInfo = controller.playbackInfo
                    if (playbackInfo != null) {
                        return try {
                            val audioSessionField = playbackInfo.javaClass.getDeclaredField("mAudioSessionId")
                            audioSessionField.isAccessible = true
                            audioSessionField.getInt(playbackInfo)
                        } catch (_: Exception) {
                            0
                        }
                    }
                }
            } catch (_: Exception) { }
        }

        // Priority 2: Just use 0 (global output mix on some devices)
        return 0
    }
}
