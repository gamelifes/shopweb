import repeatModeConst from "@/constants/repeatModeConst";
import rpx from "@/utils/rpx";
import React from "react";
import { InteractionManager, StyleSheet, View } from "react-native";

import Icon from "@/components/base/icon.tsx";
import { showPanel } from "@/components/panels/usePanel";
import TrackPlayer, { useMusicState, useRepeatMode } from "@/core/trackPlayer";
import useOrientation from "@/hooks/useOrientation";
import delay from "@/utils/delay";
import { musicIsPaused } from "@/utils/trackUtils";
import useColors from "@/hooks/useColors";

export default function () {
    const repeatMode = useRepeatMode();
    const musicState = useMusicState();

    const orientation = useOrientation();
    const colors = useColors();

    console.log(repeatMode, repeatModeConst[repeatMode]);

    return (
        <>
            <View
                style={[
                    style.wrapper,
                    orientation === "horizontal"
                        ? {
                            marginTop: 0,
                        }
                        : null,
                ]}>
                <Icon
                    color={colors.textSecondary}
                    name={repeatModeConst[repeatMode].icon}
                    size={rpx(48)}
                    onPress={async () => {
                        InteractionManager.runAfterInteractions(async () => {
                            await delay(20, false);
                            TrackPlayer.toggleRepeatMode();
                        });
                    }}
                />
                <Icon
                    color={colors.textSecondary}
                    name={"skip-left"}
                    size={rpx(48)}
                    onPress={() => {
                        TrackPlayer.skipToPrevious();
                    }}
                />
                <Icon
                    color={colors.textSecondary}
                    name={musicIsPaused(musicState) ? "play" : "pause"}
                    size={rpx(56)}
                    onPress={() => {
                        if (musicIsPaused(musicState)) {
                            TrackPlayer.play();
                        } else {
                            TrackPlayer.pause();
                        }
                    }}
                />
                <Icon
                    color={colors.textSecondary}
                    name={"skip-right"}
                    size={rpx(48)}
                    onPress={() => {
                        TrackPlayer.skipToNext();
                    }}
                />
                <Icon
                    color={colors.textSecondary}
                    name={"playlist"}
                    size={rpx(48)}
                    onPress={() => {
                        showPanel("PlayList");
                    }}
                />
            </View>
        </>
    );
}

const style = StyleSheet.create({
    wrapper: {
        width: "100%",
        // Remove marginTop to fit within the row height
        height: "100%", // Fill the row height
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
    },
});
