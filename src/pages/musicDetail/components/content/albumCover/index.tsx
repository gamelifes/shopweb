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
import Operations from "./operations";
import { showPanel } from "@/components/panels/usePanel";

interface IProps {
    onTurnPageClick?: () => void;
}

export default function AlbumCover(props: IProps) {
    const { onTurnPageClick } = props;

    const musicItem = useCurrentMusic();
    const orientation = useOrientation();

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
                <View style={styles.container}>
                    {/* Animated cover image with vinyl rotation */}
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
                            stroke={"rgba(255,255,255,0.2)"}
                            strokeWidth={2}
                            fill="transparent"
                        />
                    </Svg>
                </View>
            </GestureDetector>
            <Operations />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "transparent",
        borderRadius: rpx(20),
        overflow: "hidden",
    },
    artwork: {
        ...StyleSheet.absoluteFillObject,
    },
    svgContainer: {
        ...StyleSheet.absoluteFillObject,
    },
});