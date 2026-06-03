import React, { memo, useEffect, useState } from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import rpx from "@/utils/rpx";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { showPanel } from "../panels/usePanel";
import TrackPlayer, { useCurrentMusic, useMusicState, useProgress } from "@/core/trackPlayer";
import { musicIsPaused } from "@/utils/trackUtils";
import MusicInfo from "./musicInfo";
import Icon from "@/components/base/icon.tsx";

/**
 * MusicBar matching design's .musicbar:
 *   [44x44 cover] [song / artist ...flex] [▶ white] [☰]
 *   ──────── progress bar ────────
 */
function SimplePlayBtn() {
    const musicState = useMusicState();
    const isPaused = musicIsPaused(musicState);

    return (
        <View style={styles.playBtn}>
            <Icon
                name={isPaused ? "play" : "pause"}
                size={rpx(20)}
                color="#1a1a1e"
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
                        },
                    ]}
                    accessible
                    accessibilityLabel={`歌曲: ${musicItem.title} 歌手: ${musicItem.artist}`}>
                    {/* Top row: cover + info + controls */}
                    <View style={styles.topRow}>
                        <View style={styles.coverPlaceholder} />
                        <MusicInfo musicItem={musicItem} />
                        <View style={styles.controls}>
                            <SimplePlayBtn />
                            <Icon
                                name="playlist"
                                size={rpx(20)}
                                color="rgba(252,252,252,0.7)"
                                onPress={() => {
                                    showPanel("PlayList");
                                }}
                            />
                        </View>
                    </View>
                    {/* Progress bar */}
                    <View style={styles.progressRow}>
                        <View style={styles.progressTrack}>
                            <View
                                style={[
                                    styles.progressFill,
                                    { width: `${progressPct}%` },
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
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: rpx(12),
    },
    coverPlaceholder: {
        // The actual cover is rendered by MusicInfo which has its own FastImage
        // This space is reserved in the layout
        display: "none",
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
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    progressRow: {
        marginTop: rpx(6),
    },
    progressTrack: {
        height: rpx(3),
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: rpx(2),
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#f17d34",
        borderRadius: rpx(2),
    },
});
