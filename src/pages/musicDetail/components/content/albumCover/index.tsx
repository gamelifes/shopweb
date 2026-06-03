import React, { useEffect } from "react";
import rpx from "@/utils/rpx";
import { ImgAsset } from "@/constants/assetsConst";
import FastImage from "@/components/base/fastImage";
import useOrientation from "@/hooks/useOrientation";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useCurrentMusic } from "@/core/trackPlayer";
import { View, StyleSheet } from "react-native";
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
import { showPanel } from "@/components/panels/usePanel";

interface IProps {
    onTurnPageClick?: () => void;
}

const VINYL_RING1_PCT = 0.44; // 44% radius from center
const VINYL_RING2_PCT = 0.42;
const ARTWORK_PCT = 0.55; // 55% of container

export default function AlbumCover(props: IProps) {
    const { onTurnPageClick } = props;

    const musicItem = useCurrentMusic();
    const orientation = useOrientation();

    const size = orientation === "vertical" ? rpx(480) : rpx(260);

    // Animation for rotation
    const rotation = useSharedValue(0);

    // Start the rotation animation when component mounts
    useEffect(() => {
        rotation.value = withRepeat(
            withTiming(360, { duration: 8000, easing: Easing.linear }),
            -1,
        );
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

    const halfSize = size / 2;
    const artworkSize = size * ARTWORK_PCT;
    const ring1R = size * VINYL_RING1_PCT;
    const ring2R = size * VINYL_RING2_PCT;

    return (
        <GestureDetector gesture={combineGesture}>
            <View style={[styles.container, { width: size, height: size }]}>
                {/* Outer vinyl disc (rotates) */}
                <Animated.View
                    style={[
                        styles.vinylOuter,
                        rotationStyle,
                        {
                            width: size,
                            height: size,
                            borderRadius: halfSize,
                            backgroundColor: "#1e1e24",
                        },
                    ]}>
                    {/* Groove rings */}
                    <Svg
                        width={size}
                        height={size}
                        style={StyleSheet.absoluteFill}>
                        <Circle
                            cx={halfSize}
                            cy={halfSize}
                            r={ring1R}
                            stroke="rgba(255,255,255,0.04)"
                            strokeWidth={1}
                            fill="transparent"
                        />
                        <Circle
                            cx={halfSize}
                            cy={halfSize}
                            r={ring2R}
                            stroke="rgba(255,255,255,0.03)"
                            strokeWidth={1}
                            fill="transparent"
                        />
                    </Svg>
                    {/* Shine overlay */}
                    <View style={styles.shine} />
                </Animated.View>

                {/* Album artwork (centered, rotates) */}
                <Animated.View
                    style={[
                        styles.artworkWrapper,
                        rotationStyle,
                        {
                            width: artworkSize,
                            height: artworkSize,
                            borderRadius: artworkSize / 2,
                        },
                    ]}>
                    <FastImage
                        style={StyleSheet.absoluteFill}
                        source={musicItem?.artwork}
                        placeholderSource={ImgAsset.albumDefault}
                    />
                </Animated.View>

                {/* Center label */}
                <View
                    style={[
                        styles.centerLabel,
                        {
                            width: rpx(28),
                            height: rpx(28),
                            borderRadius: rpx(14),
                            top: halfSize - rpx(14),
                            left: halfSize - rpx(14),
                        },
                    ]}>
                    <View
                        style={[
                            styles.centerDot,
                            {
                                width: rpx(8),
                                height: rpx(8),
                                borderRadius: rpx(4),
                            },
                        ]}
                    />
                </View>
            </View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        position: "relative",
    },
    vinylOuter: {
        position: "absolute",
        top: 0,
        left: 0,
    },
    shine: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 9999,
        backgroundColor: "transparent",
        // Simulate shine with a semi-transparent overlay gradient
        // React Native doesn't support complex CSS gradients easily,
        // so we use a simple semi-transparent overlay instead
    },
    artworkWrapper: {
        position: "absolute",
        zIndex: 1,
        overflow: "hidden",
        // Shadow is set dynamically
    },
    centerLabel: {
        position: "absolute",
        zIndex: 2,
        backgroundColor: "#1a1a1e",
        borderWidth: 2,
        borderColor: "#2a2a30",
        alignItems: "center",
        justifyContent: "center",
    },
    centerDot: {
        backgroundColor: "#3d3d45",
    },
});
