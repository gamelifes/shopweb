import React, { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import rpx from "@/utils/rpx";
import Slider from "@react-native-community/slider";
import timeformat from "@/utils/timeformat";
import { fontSizeConst } from "@/constants/uiConst";
import TrackPlayer, { useProgress } from "@/core/trackPlayer";
import useColors from "@/hooks/useColors";

export default function SeekBar() {
    const progress = useProgress(1000);
    const [tmpProgress, setTmpProgress] = useState<number | null>(null);
    const slidingRef = useRef(false);
    const colors = useColors();

    return (
        <View style={style.wrapper}>
            <Text style={[style.text, { color: colors.textSecondary }]}>
                {timeformat(Math.max(tmpProgress ?? progress.position, 0))}
            </Text>
            <Slider
                style={style.slider}
                minimumTrackTintColor={colors.border}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.primary}
                minimumValue={0}
                maximumValue={progress.duration}
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
            <Text style={[style.text, { color: colors.textSecondary }]}>
                {timeformat(progress.duration)}
            </Text>
        </View>
    );
}

const style = StyleSheet.create({
    wrapper: {
        width: "100%",
        height: rpx(24),
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        paddingHorizontal: rpx(24),
    },
    slider: {
        width: "80%",
        height: rpx(4),
    },
    text: {
        fontSize: fontSizeConst.caption,
        includeFontPadding: false,
    },
});