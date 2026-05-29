import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import rpx from "@/utils/rpx";

import { ImgAsset } from "@/constants/assetsConst";
import Toast from "@/utils/toast";
import useOrientation from "@/hooks/useOrientation";
import { showPanel } from "@/components/panels/usePanel";
import TrackPlayer, { useCurrentMusic, useMusicQuality } from "@/core/trackPlayer";
import PersistStatus from "@/utils/persistStatus";
import HeartIcon from "../heartIcon";
import i18n from "@/core/i18n";

export default function Operations() {
    const musicItem = useCurrentMusic();
    const currentQuality = useMusicQuality();

    const rate = PersistStatus.useValue("music.rate", 100);
    const orientation = useOrientation();

    return (
        <View
            style={[
                styles.wrapper,
                orientation === "horizontal" ? styles.horizontalWrapper : null,
            ]}>
            <HeartIcon />
            <Pressable
                onPress={() => {
                    if (!musicItem) {
                        return;
                    }
                    showPanel("MusicQuality", {
                        musicItem,
                        async onQualityPress(quality) {
                            const changeResult =
                                await TrackPlayer.changeQuality(quality);
                            if (!changeResult) {
                                Toast.warn(i18n.t("toast.currentQualityNotAvailableForCurrentMusic"));
                            }
                        },
                    });
                }}>
                <Image
                    source={ImgAsset.quality[currentQuality]}
                    style={styles.quality}
                />
            </Pressable>
            <Pressable
                onPress={() => {
                    if (!musicItem) {
                        return;
                    }
                    showPanel("PlayRate", {
                        async onRatePress(newRate) {
                            if (rate !== newRate) {
                                try {
                                    await TrackPlayer.setRate(newRate / 100);
                                    PersistStatus.set("music.rate", newRate);
                                } catch { }
                            }
                        },
                    });
                }}>
                <Image source={ImgAsset.rate[rate!]} style={styles.quality} />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
        height: rpx(80),
        marginBottom: rpx(24),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
    },
    horizontalWrapper: {
        marginBottom: 0,
    },
    quality: {
        width: rpx(52),
        height: rpx(52),
    },
});
