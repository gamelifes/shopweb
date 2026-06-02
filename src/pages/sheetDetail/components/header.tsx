import FastImage from "@/components/base/fastImage";
import PlayAllBar from "@/components/base/playAllBar";
import ThemeText from "@/components/base/themeText";
import { ImgAsset } from "@/constants/assetsConst";
import { useI18N } from "@/core/i18n";
import { useSheetItem } from "@/core/musicSheet";
import { useParams } from "@/core/router";
import useColors from "@/hooks/useColors";
import rpx from "@/utils/rpx";
import React from "react";
import { Image, StyleSheet, View } from "react-native";

export default function Header() {
    const { id = "favorite" } = useParams<"local-sheet-detail">();
    const sheet = useSheetItem(id);
    const colors = useColors();
    const { t } = useI18N();

    const coverUri = sheet?.coverImg ?? sheet?.artwork;

    return (
        <>
            <View style={styles.hero}>
                {/* Blurred background */}
                {coverUri ? (
                    <Image
                        source={{ uri: coverUri }}
                        style={styles.blurredBg}
                        blurRadius={32}
                    />
                ) : null}
                {/* Gradient overlay */}
                <View
                    style={[
                        styles.gradient,
                        {
                            backgroundColor: colors.background,
                        },
                    ]}
                />
                {/* Content */}
                <View style={styles.content}>
                    <FastImage
                        style={styles.coverImg}
                        source={coverUri}
                        placeholderSource={ImgAsset.albumDefault}
                    />
                    <View style={styles.meta}>
                        <ThemeText
                            fontSize="title"
                            fontWeight="bold"
                            numberOfLines={2}>
                            {sheet?.title}
                        </ThemeText>
                        <ThemeText fontColor="textSecondary" fontSize="subTitle">
                            {t("sheetDetail.totalMusicCount", {
                                count: sheet?.musicList?.length ?? 0,
                            })}
                        </ThemeText>
                    </View>
                </View>
            </View>
            <PlayAllBar musicList={sheet?.musicList} musicSheet={sheet} />
        </>
    );
}

const styles = StyleSheet.create({
    hero: {
        height: rpx(260),
        position: "relative",
        overflow: "hidden",
    },
    blurredBg: {
        position: "absolute",
        top: "-20%",
        left: "-20%",
        right: "-20%",
        bottom: "-20%",
        width: "140%",
        height: "140%",
        opacity: 0.45,
    },
    gradient: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.55,
    },
    content: {
        position: "relative",
        zIndex: 2,
        flex: 1,
        flexDirection: "row",
        alignItems: "flex-end",
        gap: rpx(16),
        paddingHorizontal: rpx(24),
        paddingBottom: rpx(20),
    },
    coverImg: {
        width: rpx(120),
        height: rpx(120),
        borderRadius: rpx(14),
        flexShrink: 0,
    },
    meta: {
        flex: 1,
        paddingBottom: rpx(4),
        gap: rpx(6),
    },
});
