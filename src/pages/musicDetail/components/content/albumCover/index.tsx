import React, { useMemo, useEffect } from "react";
import rpx from "@/utils/rpx";
import { ImgAsset } from "@/constants/assetsConst";
import FastImage from "@/components/base/fastImage";
import useOrientation from "@/hooks/useOrientation";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useCurrentMusic } from "@/core/trackPlayer";
import useColors from "@/hooks/useColors";
import { View, Text, StyleSheet } from "react-native";
// Reanimated imports
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from "react-native-reanimated";
// Svg imports
import { Svg, Circle } from "react-native-svg";
import Operations from "./operations";
import { showPanel } from "@/components/panels/usePanel.ts";

interface IProps {
    onTurnPageClick?: () => void;
}

export default function AlbumCover(props: IProps) {
    const { onTurnPageClick } = props;

    const musicItem = useCurrentMusic();
    const orientation = useOrientation();
    const colors = useColors();

    const size = orientation === "vertical" ? rpx(500) : rpx(260);

    // Animation for rotation
    const rotation = useSharedValue(0);

    // Start the rotation animation when component mounts
    useEffect(() => {
        rotation.value = withRepeat(withTiming(360, { duration: 12000, easing: Easing.linear }), -1);
        // Return cleanup function
        return () => {
            rotation.value = 0;
        };
    }, []);

    const rotationStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotation.value}deg` }],
        };
    });

    // Lyric text placeholder - in a real implementation, this would come from lyricManager
    const lyricText = "歌词";

    const longPress = Gesture.LongPress()
        .onStart(() => {
            if (musicItem?.artwork) {
                showPanel("ImageViewer", {
                    url: musicItem.artwork,
                });
            }
        })
        .runOnJS(true);

    const tap = Gesture.Tap()
        .onStart(() => {
            onTurnPageClick?.();
        })
        .runOnJS(true);

    const combineGesture = Gesture.Race(tap, longPress);

    return (
        <>
            <GestureDetector gesture={combineGesture}>
                {/* Container with card-like appearance */}
                <View style={styles.container}>
                    {/* Animated cover image */}
                    <Animated.View style={[styles.artwork, rotationStyle]}>
<FastImage
    style={StyleSheet.absoluteFill}
    source={musicItem?.artwork}
    placeholderSource={ImgAsset.albumDefault}
/>
                    </Animated.View>
                    {/* Outer ring for vinyl texture */}
                    <Svg style={styles.svgContainer}>
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={size / 2 - 2}
                            stroke={colors.border}
                            strokeWidth={2}
                            fill="transparent"
                        />
                    </Svg>
                    {/* Lyrics mask overlay */}
                    <View style={styles.lyricsMask}>
                        <Text style={styles.lyricsText}>{lyricText}</Text>
                    </View>
                </View>
            </GestureDetector>
            <Operations />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        // Size will be set by parent based on orientation
        backgroundColor: "transparent",
        borderRadius: rpx(20),
        overflow: "hidden",
        // Shadow for iOS
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        // Shadow for Android
        elevation: 2,
    },
    artwork: {
        // This will be filled by the parent's size via style prop
        ...StyleSheet.absoluteFillObject,
    },
    svgContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    lyricsMask: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.35)", // Semi-transparent dark overlay
        justifyContent: "center",
        alignItems: "center",
    },
    lyricsText: {
        color: "#FFFFFF",
        fontSize: rpx(14),
        textAlign: "center",
    },
});