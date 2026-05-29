import "react-native-get-random-values";

import { showDialog } from "@/components/dialogs/useDialog.ts";
import { ImgAsset } from "@/constants/assetsConst";
import pathConst from "@/constants/pathConst";
import Config from "@/core/appConfig";
import LocalMusicSheet from "@/core/localMusicSheet";
import lyricManager from "@/core/lyricManager";
import musicHistory from "@/core/musicHistory";
import MusicSheet from "@/core/musicSheet";
import Theme from "@/core/theme";
import TrackPlayer from "@/core/trackPlayer";
import NativeUtils from "@/native/utils";
import { checkAndCreateDir } from "@/utils/fileUtils";
import { errorLog, trace } from "@/utils/log";
import { IPerfLogger, perfLogger } from "@/utils/perfLogger";
import PersistStatus from "@/utils/persistStatus";
import * as SplashScreen from "expo-splash-screen";
import {  Linking, Platform } from "react-native";
import { PERMISSIONS, check, request } from "react-native-permissions";
import RNTrackPlayer, { AppKilledPlaybackBehavior, Capability } from "react-native-track-player";
import i18n from "@/core/i18n";
import bootstrapAtom from "./bootstrap.atom";
import { getDefaultStore } from "jotai";


// 依赖管理
musicHistory.injectDependencies(Config);
TrackPlayer.injectDependencies(Config, musicHistory);
lyricManager.injectDependencies(TrackPlayer, Config);
MusicSheet.injectDependencies(Config);


async function bootstrapImpl() {
    await SplashScreen.preventAutoHideAsync()
        .then(result =>
            console.log(
                `SplashScreen.preventAutoHideAsync() succeeded: ${result}`,
            ),
        )
        .catch(console.warn); // it's good to explicitly catch and inspect any error
    const logger = perfLogger();
    // 1. 检查权限
    if (Platform.OS === "android" && Platform.Version >= 30) {
        const hasPermission = await NativeUtils.checkStoragePermission();
        if (
            !hasPermission &&
            !PersistStatus.get("app.skipBootstrapStorageDialog")
        ) {
            showDialog("CheckStorage");
        }
    } else {
        const [readStoragePermission, writeStoragePermission] =
            await Promise.all([
                check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE),
                check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE),
            ]);
        if (
            !(
                readStoragePermission === "granted" &&
                writeStoragePermission === "granted"
            )
        ) {
            await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
            await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
        }
    }
    logger.mark("权限检查完成");

    // 2. 数据初始化
    /** 初始化路径 */
    await setupFolder();
    trace("文件夹初始化完成");
    logger.mark("文件夹初始化完成");



    // 加载配置
    await Promise.all([
        Config.setup().then(() => {
            logger.mark("Config");
        }),
        MusicSheet.setup().then(() => {
            logger.mark("MusicSheet");
        }),
        musicHistory.setup().then(() => {
            logger.mark("musicHistory");
        }),
    ]);
    trace("配置初始化完成");
    logger.mark("配置初始化完成");

    await initTrackPlayer(logger).catch(err => {
        // 初始化播放器出错，延迟初始化
        const bootstrapState = getDefaultStore().get(bootstrapAtom);

        if (bootstrapState.state === "Loading") {
            getDefaultStore().set(bootstrapAtom, {
                state: "TrackPlayerError",
                reason: err,
            });
        }
    });

    await LocalMusicSheet.setup();
    trace("本地音乐初始化完成");
    logger.mark("本地音乐初始化完成");

    Theme.setup();
    trace("主题初始化完成");
    logger.mark("主题初始化完成");

    extraMakeup();

    i18n.setup();
    logger.mark("语言模块初始化完成");
    
    ErrorUtils.setGlobalHandler(error => {
        errorLog("未捕获的错误", error);
    });
}

/** 初始化 */
async function setupFolder() {
    await Promise.all([
        checkAndCreateDir(pathConst.dataPath),
        checkAndCreateDir(pathConst.logPath),
        checkAndCreateDir(pathConst.cachePath),
        checkAndCreateDir(pathConst.lrcCachePath),
        checkAndCreateDir(pathConst.localLrcPath),
    ]);
}

export async function initTrackPlayer(logger?: IPerfLogger) {
    try {
        await RNTrackPlayer.setupPlayer({
            maxCacheSize:
                Config.getConfig("basic.maxCacheSize") ?? 1024 * 1024 * 512,
        });
    } catch (e: any) {
        if (
            e?.message !==
            "The player has already been initialized via setupPlayer."
        ) {
            throw e;
        }
    }
    logger?.mark("加载播放器");

    const capabilities = Config.getConfig("basic.showExitOnNotification")
        ? [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.Stop,
        ]
        : [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
        ];
    await RNTrackPlayer.updateOptions({
        icon: ImgAsset.logoTransparent,
        progressUpdateEventInterval: 1,
        android: {
            alwaysPauseOnInterruption: true,
            appKilledPlaybackBehavior:
                AppKilledPlaybackBehavior.ContinuePlayback,
        },
        capabilities: capabilities,
        compactCapabilities: capabilities,
        notificationCapabilities: [...capabilities, Capability.SeekTo],
    });
    logger?.mark("播放器初始化完成");
    trace("播放器初始化完成");

    await TrackPlayer.setupTrackPlayer();
    trace("播放列表初始化完成");
    logger?.mark("播放列表初始化完成");

    await lyricManager.setup();

    logger?.mark("歌词初始化完成");
}


/** 不需要阻塞的 */
async function extraMakeup() {
    async function handleLinkingUrl(url: string) {
        try {
            if (url.startsWith("musicfree://app")) {
                // 本地播放
                console.log(url);
            }
        } catch { }
    }

    // 开启监听
    Linking.addEventListener("url", data => {
        if (data.url) {
            handleLinkingUrl(data.url);
        }
    });
    const initUrl = await Linking.getInitialURL();
    if (initUrl) {
        handleLinkingUrl(initUrl);
    }

    if (Config.getConfig("basic.autoPlayWhenAppStart")) {
        TrackPlayer.play();
    }
}


export default async function () {
    try {
        getDefaultStore().set(bootstrapAtom, {
            "state": "Loading",
        });
        await bootstrapImpl();
        getDefaultStore().set(bootstrapAtom, {
            "state": "Done",
        });
    } catch (e: any) {
        errorLog("初始化出错", e);
        if (getDefaultStore().get(bootstrapAtom).state === "Loading") {
            getDefaultStore().set(bootstrapAtom, {
                state: "Fatal",
                reason: e,
            });
        }
    }
    // 隐藏开屏动画
    console.log("HIDE");
    await SplashScreen.hideAsync();
}