import React, { useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";
import { LinearGradient } from "react-native-linear-gradient";
import { ImgAsset } from "@/constants/assetsConst";
import { useCurrentMusic } from "@/core/trackPlayer";
import useColors from "@/hooks/useColors";

export default function Background() {
    const musicItem = useCurrentMusic();
    const colors = useColors();

    const artworkSource = useMemo(() => {
        if (!musicItem?.artwork) {
            return ImgAsset.albumDefault;
        }

        if(typeof musicItem.artwork === "string") {
            return {
                uri: musicItem.artwork,
            };
        }
        return musicItem.artwork;

    }, [musicItem?.artwork]);

    // Extract dominant color from artwork as fallback to theme primary
    // For now, we use theme primary as the overlay color; later can integrate a color extraction library
    const overlayColor = colors.primary; // e.g., Shopify blue/green

    return (
        <>
            {/* Base background color from theme background */}
            <View style={[style.background, { backgroundColor: colors.background }]} />
            {/* Blurred image */}
            <Image style={style.blur} blurRadius={20} source={artworkSource} />
            {/* Semi-transparent gradient overlay to soften the blur and add depth */}
            <LinearGradient
                colors={[
                    `${overlayColor}33`, // 20% opacity
                    `${overlayColor}00`, // transparent
                ]}
                style={style.overlay}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />
        </>
    );
}

const style = StyleSheet.create({
    background: {
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    blur: {
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.4, // reduced opacity for softer blur
    },
    overlay: {
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
});
