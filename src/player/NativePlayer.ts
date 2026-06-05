/**
 * 自建 AndroidX 播放内核 - JS 侧入口
 *
 * 阶段 0 脚手架：仅暴露 ping() 用于验证桥通。
 * 完整接口见 docs/playback-engine-androidx.md 第 6 章。
 *
 * 容错策略：Native 模块尚未注册时降级为 noop，避免 RNTP 双轨期崩溃。
 */

import { NativeModules, Platform } from "react-native";

interface INativePlayer {
  /** 健康检查：返回 "pong" 表示桥通 */
  ping(): Promise<string>;
}

interface NativePlayerShim {
  ping: () => Promise<string>;
}

const native = (NativeModules as Record<string, NativePlayerShim | undefined>)
    .NativePlayer;

const NativePlayer: INativePlayer = native ?? {
    ping: () => {
        if (__DEV__) {
            console.warn(
                `[NativePlayer] 模块未注册 (platform=${Platform.OS})，ping() 返回 noop。` +
          "若已执行阶段 0 脚手架，请检查 MainApplication.kt 是否注册 PlayerPackage。",
            );
        }
        return Promise.resolve("noop");
    },
};

export default NativePlayer;
export type { INativePlayer };
