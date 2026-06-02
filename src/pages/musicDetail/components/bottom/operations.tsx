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
                color={isFav ? colors.primary : colors.textSecondary}
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
                color={colors.textSecondary}
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
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
        paddingHorizontal: rpx(60),
    },
});
