import React, { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import rpx from "@/utils/rpx";
import Slider from "@react-native-community/slider";
import timeformat from "@/utils/timeformat";
import TrackPlayer, { useProgress } from "@/core/trackPlayer";

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

    const currentPosition = tmpProgress ?? progress.position;
    const positionText = timeformat(Math.max(currentPosition, 0));
    const durationText = timeformat(progress.duration);

    return (
        <View style={styles.wrapper}>
            <Text style={styles.time}>{positionText}</Text>
            <Slider
                style={styles.slider}
                minimumTrackTintColor="rgba(255,255,255,0.7)"
                maximumTrackTintColor="rgba(255,255,255,0.1)"
                thumbTintColor="white"
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
            <Text style={styles.time}>{durationText}</Text>
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
