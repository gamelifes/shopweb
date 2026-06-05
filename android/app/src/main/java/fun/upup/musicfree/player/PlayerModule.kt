package `fun`.upup.musicfree.player

import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * 阶段 0 脚手架：自建 AndroidX 播放内核的 React Native 桥接入口
 *
 * 当前仅暴露 [ping] 一个方法用于验证：
 *   - Package 注册是否成功
 *   - JS ↔ Native 双向桥接是否通
 *   - Old Architecture 编译管线是否兼容
 *
 * 完整路径见 docs/playback-engine-androidx.md：
 *   阶段 1：PlaybackController / PlayQueue / StateMachine
 *   阶段 2：补齐 play/pause/seek/load/skipToNext/skipToPrevious 等接口
 *   阶段 3：替换 react-native-track-player 调用
 *   阶段 4：音频效果接管（解 audioSessionId 绑定问题）
 */
class PlayerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val tag = "PlayerModule"

    override fun getName(): String = MODULE_NAME

    /**
     * 健康检查方法：JS 调 [NativePlayer.ping] 验证桥通
     */
    @ReactMethod
    fun ping(promise: Promise) {
        Log.i(tag, "ping() called from JS")
        promise.resolve("pong")
    }

    companion object {
        const val MODULE_NAME = "NativePlayer"
    }
}
