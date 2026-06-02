import React from "react";
import { StyleSheet, Text, View } from "react-native";
import rpx from "@/utils/rpx";
import { useNavigation } from "@react-navigation/native";
import Tag from "@/components/base/tag";
import { fontSizeConst, fontWeightConst } from "@/constants/uiConst";
import Share from "react-native-share";
import { B64Asset } from "@/constants/assetsConst";
import IconButton from "@/components/base/iconButton";
import { useCurrentMusic } from "@/core/trackPlayer";
import useColors from "@/hooks/useColors";

export default function NavBar() {
    const navigation = useNavigation();
    const musicItem = useCurrentMusic();
    const colors = useColors();

    const styles = StyleSheet.create({
        container: {
            width: "100%",
            height: rpx(56),
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: rpx(16),
        },
        button: {
            marginHorizontal: 0,
            padding: rpx(12),
        },
        headerContent: {
            flex: 1,
            height: rpx(56),
            justifyContent: "center",
            alignItems: "center",
        },
        headerTitleText: {
            fontWeight: fontWeightConst.semibold,
            fontSize: fontSizeConst.title,
            marginBottom: rpx(4),
            includeFontPadding: false,
        },
        headerDesc: {
            height: rpx(24),
            flexDirection: "row",
            alignItems: "center",
        },
        headerArtistText: {
            fontSize: fontSizeConst.subTitle,
            includeFontPadding: false,
        },
        tagBg: {
            borderRadius: rpx(4),
            paddingHorizontal: rpx(6),
            paddingVertical: rpx(2),
            marginLeft: rpx(8),
        },
        tagText: {
            fontSize: rpx(12),
            fontWeight: fontWeightConst.medium,
        },
        followTagBg: {
            borderRadius: rpx(4),
            paddingHorizontal: rpx(6),
            paddingVertical: rpx(2),
            marginLeft: rpx(8),
        },
        followTagText: {
            fontSize: rpx(12),
            fontWeight: fontWeightConst.medium,
        },
    });

    return (
        <View style={[styles.container, { backgroundColor: "rgba(0,0,0,0.15)" }]}>
            <IconButton
                name="arrow-left"
                sizeType={"normal"}
                color={colors.text}
                style={styles.button}
                onPress={() => {
                    navigation.goBack();
                }}
            />
            <View style={styles.headerContent}>
                <Text
                    numberOfLines={1}
                    style={[styles.headerTitleText, { color: colors.text }]}>
                    {musicItem?.title ?? "--"}
                </Text>
                <View style={styles.headerDesc}>
                    <Text
                        style={[styles.headerArtistText, { color: colors.textSecondary }]}
                        numberOfLines={1}>
                        {musicItem?.artist}
                    </Text>
                    {musicItem?.platform ? (
                        <Tag
                            tagName={musicItem.platform}
                            containerStyle={[
                                styles.tagBg,
                                {
                                    backgroundColor: `${colors.primary}15`,
                                    borderRadius: rpx(4),
                                    paddingHorizontal: rpx(6),
                                    paddingVertical: rpx(2),
                                    marginLeft: rpx(8),
                                },
                            ]}
                            style={[styles.tagText, { color: colors.primary }]}
                        />
                    ) : null}
                    <Tag
                        tagName="关注"
                        containerStyle={[
                            styles.followTagBg,
                            {
                                backgroundColor: `${colors.primary}15`,
                                borderRadius: rpx(4),
                                paddingHorizontal: rpx(6),
                                paddingVertical: rpx(2),
                                marginLeft: rpx(8),
                            },
                        ]}
                        style={[styles.followTagText, { color: colors.primary }]}
                    />
                </View>
            </View>
            <IconButton
                name="share"
                color={colors.text}
                sizeType="normal"
                style={styles.button}
                onPress={async () => {
                    try {
                        await Share.open({
                            type: "image/jpeg",
                            title: "MusicFree-一个插件化的免费音乐播放器",
                            message: "MusicFree-一个插件化的免费音乐播放器",
                            url: B64Asset.share,
                            subject: "MusicFree分享",
                        });
                    } catch {}
                }}
            />
        </View>
    );
}