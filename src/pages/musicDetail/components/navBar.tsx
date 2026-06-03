import React from "react";
import { StyleSheet, Text, View } from "react-native";
import rpx from "@/utils/rpx";
import { useNavigation } from "@react-navigation/native";
import IconButton from "@/components/base/iconButton";
import { useCurrentMusic } from "@/core/trackPlayer";
import { showPanel } from "@/components/panels/usePanel";

/**
 * Simplified NavBar matching the design's md-nav:
 *   ← back | song title / artist | ... more
 */
export default function NavBar() {
    const navigation = useNavigation();
    const musicItem = useCurrentMusic();

    return (
        <View style={styles.container}>
            <IconButton
                name="arrow-left"
                sizeType={"normal"}
                color="white"
                style={styles.button}
                onPress={() => {
                    navigation.goBack();
                }}
            />
            <View style={styles.info}>
                <Text
                    numberOfLines={1}
                    style={styles.title}>
                    {musicItem?.title ?? "--"}
                </Text>
                <Text
                    numberOfLines={1}
                    style={styles.artist}>
                    {musicItem?.artist}
                </Text>
            </View>
            <IconButton
                name="ellipsis-vertical"
                sizeType={"normal"}
                color="rgba(255,255,255,0.7)"
                style={styles.button}
                onPress={() => {
                    if (musicItem) {
                        showPanel("MusicItemLyricOptions", {
                            musicItem: musicItem,
                        });
                    }
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: rpx(48),
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: rpx(12),
    },
    button: {
        width: rpx(36),
        height: rpx(36),
        borderRadius: rpx(18),
    },
    info: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: rpx(12),
    },
    title: {
        fontSize: rpx(16),
        fontWeight: "700",
        color: "white",
        textAlign: "center",
        includeFontPadding: false,
    },
    artist: {
        fontSize: rpx(12),
        color: "rgba(255,255,255,0.65)",
        marginTop: rpx(1),
        textAlign: "center",
        includeFontPadding: false,
    },
});
