import FastImage from "@/components/base/fastImage";
import PlayAllBar from "@/components/base/playAllBar";
import { ImgAsset } from "@/constants/assetsConst";
import { useI18N } from "@/core/i18n";
import { useSheetItem } from "@/core/musicSheet";
import { useParams } from "@/core/router";
import rpx from "@/utils/rpx";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function Header() {
    const { id = "favorite" } = useParams<"local-sheet-detail">();
    const sheet = useSheetItem(id);
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
                <View
                    style={[
                        styles.gradient,
                        { backgroundColor: "#1a1a1e" },
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
                        <Text style={styles.title} numberOfLines={2}>
                            {sheet?.title}
                        </Text>
                        <Text style={styles.desc}>
                            {t("sheetDetail.totalMusicCount", {
                                count: sheet?.musicList?.length ?? 0,
                            })}
                        </Text>
                    </View>
                </View>
            </View>
            <PlayAllBar musicList={sheet?.musicList} musicSheet={sheet} />
        </>
    );
}

const styles = StyleSheet.create({
    hero: {
        height: rpx(200),
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
        opacity: 0.6,
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
        paddingHorizontal: rpx(20),
        paddingBottom: rpx(16),
    },
    coverImg: {
        width: rpx(80),
        height: rpx(80),
        borderRadius: rpx(12),
        flexShrink: 0,
    },
    meta: {
        flex: 1,
        paddingBottom: rpx(4),
    },
    title: {
        fontSize: rpx(20),
        fontWeight: "700",
        color: "white",
    },
    desc: {
        fontSize: rpx(13),
        color: "rgba(252,252,252,0.65)",
        marginTop: rpx(4),
    },
});
