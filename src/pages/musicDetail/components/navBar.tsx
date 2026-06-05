import React from "react";
import { StyleSheet, Text, View } from "react-native";
import rpx from "@/utils/rpx";
import { useNavigation } from "@react-navigation/native";
import IconButton from "@/components/base/iconButton";
import { useCurrentMusic } from "@/core/trackPlayer";
import { showPanel } from "@/components/panels/usePanel";
import useColors from "@/hooks/useColors";

/**
 * Simplified NavBar matching the design's md-nav:
 *   ← back | song title / artist | ... more
 */
export default function NavBar() {
    const navigation = useNavigation();
    const musicItem = useCurrentMusic();
    const colors = useColors();

    return (
        <View style={styles.container}>
            <IconButton
                name="arrow-left"
                sizeType={"normal"}
                color={colors.appBarText}
                style={styles.button}
                onPress={() => {
                    navigation.goBack();
                }}
            />
            <View style={styles.info}>
                <Text
                    numberOfLines={1}
                    style={[styles.title, { color: colors.appBarText }]}>
                    {musicItem?.title ?? "--"}
                </Text>
                <Text
                    numberOfLines={1}
                    style={[styles.artist, { color: colors.appBarText }]}>
                    {musicItem?.artist}
                </Text>
            </View>
            <IconButton
                name="ellipsis-vertical"
                sizeType={"normal"}
                color={colors.appBarText}
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
        textAlign: "center",
        includeFontPadding: false,
    },
    artist: {
        fontSize: rpx(12),
        marginTop: rpx(1),
        textAlign: "center",
        includeFontPadding: false,
    },
});
