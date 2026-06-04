import React, { memo, useEffect, useState } from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import rpx from "@/utils/rpx";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { showPanel } from "../panels/usePanel";
import TrackPlayer, { useCurrentMusic, useMusicState, useProgress } from "@/core/trackPlayer";
import { musicIsPaused } from "@/utils/trackUtils";
import MusicInfo from "./musicInfo";
import Icon from "@/components/base/icon.tsx";
import useColors from "@/hooks/useColors";

/**
 * MusicBar matching design's .musicbar:
 *   [44x44 cover] [song / artist ...flex] [▶ white] [☰]
 *   ──────── progress bar ────────
 */
function SimplePlayBtn() {
    const musicState = useMusicState();
    const isPaused = musicIsPaused(musicState);
    const colors = useColors();

    return (
        <View
            style={[
                styles.playBtn,
                {
                    backgroundColor: colors.text,
                    shadowColor: colors.text + "80",
                },
            ]}>
            <Icon
                name={isPaused ? "play" : "pause"}
                size={rpx(20)}
                color={colors.card}
                onPress={async () => {
                    if (isPaused) {
                        await TrackPlayer.play();
                    } else {
                        await TrackPlayer.pause();
                    }
                }}
            />
        </View>
    );
}

function MusicBar() {
    const musicItem = useCurrentMusic();
    const progress = useProgress();
    const [showKeyboard, setKeyboardStatus] = useState(false);
    const safeAreaInsets = useSafeAreaInsets();
    const colors = useColors();

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
                        styles.wrapper,
                        {
                            paddingBottom: safeAreaInsets.bottom + rpx(10),
                            paddingLeft: safeAreaInsets.left + rpx(16),
                            paddingRight: safeAreaInsets.right + rpx(16),
                            borderTopWidth: StyleSheet.hairlineWidth,
                            borderTopColor: colors.divider,
                        },
                    ]}
                    accessible
                    accessibilityLabel={`歌曲: ${musicItem.title} 歌手: ${musicItem.artist}`}>
                    {/* Top row: cover + info + controls */}
                    <View style={styles.topRow}>
                        <MusicInfo musicItem={musicItem} />
                        <View style={styles.controls}>
                            <SimplePlayBtn />
                            <Icon
                                name="playlist"
                                size={rpx(20)}
                                color={colors.textSecondary}
                                onPress={() => {
                                    showPanel("PlayList");
                                }}
                            />
                        </View>
                    </View>
                    {/* Progress bar */}
                    <View style={styles.progressRow}>
                        <View
                            style={[
                                styles.progressTrack,
                                { backgroundColor: "rgba(0,0,0,0.06)" },
                            ]}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${progressPct}%`,
                                        backgroundColor: colors.primary,
                                    },
                                ]}
                            />
                        </View>
                    </View>
                </View>
            )}
        </>
    );
}

export default memo(MusicBar, () => true);

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
        paddingTop: rpx(12),
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: rpx(12),
    },
    controls: {
        flexDirection: "row",
        alignItems: "center",
        gap: rpx(4),
    },
    playBtn: {
        width: rpx(40),
        height: rpx(40),
        borderRadius: rpx(20),
        backgroundColor: "var(--text)", // will be replaced by colors.text at runtime
        alignItems: "center",
        justifyContent: "center",
    },
    progressRow: {
        marginTop: rpx(6),
    },
    progressTrack: {
        height: rpx(3),
        borderRadius: rpx(2),
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: rpx(2),
    },
});
