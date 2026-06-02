import React, { memo, useEffect, useState } from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import rpx from "@/utils/rpx";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { showPanel } from "../panels/usePanel";
import useColors from "@/hooks/useColors";
import IconButton from "../base/iconButton";
import TrackPlayer, { useCurrentMusic, useMusicState, useProgress } from "@/core/trackPlayer";
import { musicIsPaused } from "@/utils/trackUtils";
import MusicInfo from "./musicInfo";
import Icon from "@/components/base/icon.tsx";
import color from "color";

function SimplePlayBtn() {
    const musicState = useMusicState();
    const colors = useColors();

    const isPaused = musicIsPaused(musicState);

    return (
        <IconButton
            accessibilityLabel={"播放或暂停歌曲"}
            name={isPaused ? "play" : "pause"}
            sizeType={"normal"}
            hitSlop={{
                top: 10,
                left: 10,
                right: 10,
                bottom: 10,
            }}
            color={colors.musicBarText}
            onPress={async () => {
                if (isPaused) {
                    await TrackPlayer.play();
                } else {
                    await TrackPlayer.pause();
                }
            }}
        />
    );
}
function MusicBar() {
    const musicItem = useCurrentMusic();
    const progress = useProgress();

    const [showKeyboard, setKeyboardStatus] = useState(false);

    const colors = useColors();
    const safeAreaInsets = useSafeAreaInsets();

    useEffect(() => {
        const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
            setKeyboardStatus(true);
        });
        const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
            setKeyboardStatus(false);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    const progressPct = progress?.duration
        ? Math.min((progress.position / progress.duration) * 100, 100)
        : 0;

    return (
        <>
            {musicItem && !showKeyboard && (
                <View
                    style={[
                        style.wrapper,
                        {
                            backgroundColor: color(colors.musicBar).alpha(0.92).toString(),
                            borderTopColor: colors.divider,
                            borderTopWidth: StyleSheet.hairlineWidth,
                            paddingBottom: safeAreaInsets.bottom + rpx(8),
                            paddingLeft: safeAreaInsets.left,
                            paddingRight: safeAreaInsets.right + rpx(24),
                        },
                    ]}
                    accessible
                    accessibilityLabel={`歌曲: ${musicItem.title} 歌手: ${musicItem.artist}`}
                >
                    <View style={style.topRow}>
                        <MusicInfo musicItem={musicItem} />
                        <View style={style.actionGroup}>
                            <SimplePlayBtn />
                            <Icon
                                accessible
                                accessibilityLabel="播放列表"
                                name="playlist"
                                size={rpx(56)}
                                onPress={() => {
                                    showPanel("PlayList");
                                }}
                                color={colors.musicBarText}
                                style={[style.actionIcon]}
                            />
                        </View>
                    </View>
                    <View style={[style.progressRow, { paddingLeft: safeAreaInsets.left + rpx(24) }]}>
                        <View style={[style.progressTrack, { backgroundColor: color(colors.divider).alpha(0.3).toString() }]}>
                            <View style={[style.progressFill, { width: `${progressPct}%`, backgroundColor: colors.primary }]} />
                        </View>
                    </View>
                </View>
            )}
        </>
    );
}

export default memo(MusicBar, () => true);

const style = StyleSheet.create({
    wrapper: {
        width: "100%",
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        height: rpx(100),
    },
    actionGroup: {
        width: rpx(140),
        justifyContent: "flex-end",
        flexDirection: "row",
        alignItems: "center",
    },
    actionIcon: {
        marginLeft: rpx(24),
    },
    progressRow: {
        paddingRight: rpx(24),
        paddingBottom: rpx(10),
    },
    progressTrack: {
        height: rpx(4),
        borderRadius: rpx(2),
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: rpx(2),
    },
});
