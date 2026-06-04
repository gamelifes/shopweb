import React, { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import rpx from "@/utils/rpx";
import Slider from "@react-native-community/slider";
import timeformat from "@/utils/timeformat";
import TrackPlayer, { useProgress } from "@/core/trackPlayer";
import useColors from "@/hooks/useColors";
import Color from "color";

/**
 * SeekBar matching design spec:
 *   [time] ———●—————————————————— [time]
 *   - Track: 4px height, rgba(255,255,255,0.1)
 *   - Fill: gradient white → rgba(255,255,255,0.7)
 *   - Knob: 12px white circle with shadow
 *   - Time: 11px, muted, tabular-nums
 */
export default function SeekBar() {
    const progress = useProgress(1000);
    const [tmpProgress, setTmpProgress] = useState<number | null>(null);
    const slidingRef = useRef(false);
    const colors = useColors();

    const currentPosition = tmpProgress ?? progress.position;
    const positionText = timeformat(Math.max(currentPosition, 0));
    const durationText = timeformat(progress.duration);

    // Track colors matching design
    const trackBackground = Color(colors.text).alpha(0.06).toString(); // light: rgba(0,0,0,0.06)
    const trackFill = colors.primary;

    return (
        <View style={styles.wrapper}>
            <Text style={[styles.time, { color: colors.textSecondary }]}>{positionText}</Text>
            <Slider
                style={styles.slider}
                minimumTrackTintColor={trackFill}
                maximumTrackTintColor={trackBackground}
                thumbTintColor={colors.text}
                minimumValue={0}
                maximumValue={progress.duration || 1}
                onSlidingStart={() => {
                    slidingRef.current = true;
                }}
                onValueChange={val => {
                    if (slidingRef.current) {
                        setTmpProgress(val);
                    }
                }}
                onSlidingComplete={val => {
                    slidingRef.current = false;
                    setTmpProgress(null);
                    if (val >= progress.duration - 2) {
                        val = progress.duration - 2;
                    }
                    TrackPlayer.seekTo(val);
                }}
                value={progress.position}
            />
            <Text style={[styles.time, { color: colors.textSecondary }]}>{durationText}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: "row",
        alignItems: "center",
        gap: rpx(12),
        marginBottom: rpx(14),
    },
    slider: {
        flex: 1,
        height: rpx(4),
    },
    time: {
        fontSize: rpx(11),
        color: "rgba(255,255,255,0.4)",
        fontWeight: "500",
        minWidth: rpx(36),
        fontVariant: ["tabular-nums"],
    },
});
