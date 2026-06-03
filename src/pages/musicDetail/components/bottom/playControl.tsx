import repeatModeConst from "@/constants/repeatModeConst";
import rpx from "@/utils/rpx";
import React from "react";
import { InteractionManager, StyleSheet, View } from "react-native";

import Icon from "@/components/base/icon.tsx";
import { showPanel } from "@/components/panels/usePanel";
import TrackPlayer, { useMusicState, useRepeatMode } from "@/core/trackPlayer";
import delay from "@/utils/delay";
import { musicIsPaused } from "@/utils/trackUtils";

/**
 * PlayControl matching design:
 *   [repeat/shuffle] [prev] [▶/⏸ 56px] [next] [list]
 *   - Small buttons: 40x40
 *   - Main button: 56x56 white bg
 *   - Gap: 8px
 */
export default function () {
    const repeatMode = useRepeatMode();
    const musicState = useMusicState();

    return (
        <View style={styles.wrapper}>
            <Icon
                color="rgba(255,255,255,0.75)"
                name={repeatModeConst[repeatMode].icon}
                size={rpx(40)}
                onPress={async () => {
                    InteractionManager.runAfterInteractions(async () => {
                        await delay(20, false);
                        TrackPlayer.toggleRepeatMode();
                    });
                }}
            />
            <Icon
                color="rgba(255,255,255,0.75)"
                name={"skip-left"}
                size={rpx(40)}
                onPress={() => {
                    TrackPlayer.skipToPrevious();
                }}
            />
            <View style={styles.mainBtn}>
                <Icon
                    color="#1a1a1e"
                    name={musicIsPaused(musicState) ? "play" : "pause"}
                    size={rpx(28)}
                    onPress={() => {
                        if (musicIsPaused(musicState)) {
                            TrackPlayer.play();
                        } else {
                            TrackPlayer.pause();
                        }
                    }}
                />
            </View>
            <Icon
                color="rgba(255,255,255,0.75)"
                name={"skip-right"}
                size={rpx(40)}
                onPress={() => {
                    TrackPlayer.skipToNext();
                }}
            />
            <Icon
                color="rgba(255,255,255,0.75)"
                name={"playlist"}
                size={rpx(40)}
                onPress={() => {
                    showPanel("PlayList");
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: rpx(8),
    },
    mainBtn: {
        width: rpx(56),
        height: rpx(56),
        borderRadius: rpx(28),
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "center",
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
});
