import React from "react";
import { StyleSheet, View } from "react-native";
import rpx from "@/utils/rpx";
import Icon from "@/components/base/icon";
import { useCurrentMusic } from "@/core/trackPlayer";
import MusicSheet, { useFavorite } from "@/core/musicSheet";
import useColors from "@/hooks/useColors";

export default function Operations() {
    const musicItem = useCurrentMusic();
    const isFav = useFavorite(musicItem);
    const colors = useColors();

    return (
        <View style={styles.wrapper}>
            <Icon
                name={isFav ? "heart" : "heart-outline"}
                color={isFav ? colors.primary : "rgba(255,255,255,0.7)"}
                size={rpx(44)}
                onPress={async () => {
                    if (!musicItem) return;
                    if (isFav) {
                        await MusicSheet.removeMusic(
                            MusicSheet.defaultSheet.id,
                            musicItem,
                        );
                    } else {
                        await MusicSheet.addMusic(
                            MusicSheet.defaultSheet.id,
                            musicItem,
                        );
                    }
                }}
            />
            <Icon
                name="share"
                color="rgba(255,255,255,0.7)"
                size={rpx(44)}
                onPress={() => {
                    // Share handled by navBar; could add custom behavior
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: rpx(32),
        marginBottom: rpx(12),
    },
});
