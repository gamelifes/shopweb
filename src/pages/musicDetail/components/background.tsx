import React, { useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";
import { LinearGradient } from "react-native-linear-gradient";
import { ImgAsset } from "@/constants/assetsConst";
import { useCurrentMusic } from "@/core/trackPlayer";

/**
 * MusicDetail page background matching the design:
 *  - Base solid background (#1a1a1e)
 *  - Blurred artwork image spanning -20% extra on all sides
 *  - Gradient overlay: top tint (accent) → transparent → bottom black
 */
export default function Background() {
    const musicItem = useCurrentMusic();

    const artworkSource = useMemo(() => {
        if (!musicItem?.artwork) {
            return ImgAsset.albumDefault;
        }

        if (typeof musicItem.artwork === "string") {
            return {
                uri: musicItem.artwork,
            };
        }
        return musicItem.artwork;
    }, [musicItem?.artwork]);

    return (
        <>
            {/* Base background color */}
            <View style={[styles.background, { backgroundColor: "#1a1a1e" }]} />
            {/* Blurred artwork image */}
            <View style={styles.blurContainer}>
                <Image
                    style={styles.blur}
                    blurRadius={40}
                    source={artworkSource}
                />
            </View>
            {/* Gradient overlay: accent tint → transparent → dark */}
            <LinearGradient
                colors={[
                    "rgba(63,163,181,0.08)", // teal tint top
                    "transparent",
                    "transparent",
                    "rgba(0,0,0,0.4)", // dark bottom
                ]}
                style={styles.overlay}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                locations={[0, 0.4, 0.7, 1]}
            />
        </>
    );
}

const styles = StyleSheet.create({
    background: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    blurContainer: {
        position: "absolute",
        top: "-20%",
        left: "-20%",
        right: "-20%",
        bottom: "-20%",
        opacity: 0.5,
    },
    blur: {
        width: "100%",
        height: "100%",
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
});
