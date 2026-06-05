package fun.upup.musicfree.player

import android.view.View
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ReactShadowNode
import com.facebook.react.uimanager.ViewManager

/**
 * 注册 PlayerModule 到 React Native Bridge
 *
 * 阶段 0 脚手架：与 AudioEffectPackage / LyricUtilPackage 同级注册
 * 完整路径：docs/playback-engine-androidx.md
 */
class PlayerPackage : ReactPackage {

    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): MutableList<ViewManager<View, ReactShadowNode<*>>> = mutableListOf()

    override fun createNativeModules(
        reactContext: ReactApplicationContext
    ): MutableList<NativeModule> = listOf(PlayerModule(reactContext)).toMutableList()
}
