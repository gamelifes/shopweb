import Empty from "@/components/base/empty";
import { showDialog } from "@/components/dialogs/useDialog";
import { showPanel } from "@/components/panels/usePanel";
import { ImgAsset } from "@/constants/assetsConst";
import { useI18N } from "@/core/i18n";
import MusicSheet, { useSheetsBase, useStarredSheets } from "@/core/musicSheet";
import useColors from "@/hooks/useColors";
import { ROUTE_PATH } from "@/core/router";
import rpx from "@/utils/rpx";
import Toast from "@/utils/toast";
import { FlashList } from "@shopify/flash-list";
import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { localPluginPlatform } from "@/constants/commonConst";
import FastImage from "@/components/base/fastImage";
import Icon from "@/components/base/icon";

export default function Sheets() {
    const [index, setIndex] = useState(0);
    const colors = useColors();
    const navigation = useNavigation<any>();

    const allSheets = useSheetsBase();
    const staredSheets = useStarredSheets();
    const { t } = useI18N();

    return (
        <>
            {/* Header tabs matching design */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.tab}
                    onPress={() => setIndex(0)}>
                    <Text style={[styles.tabText, index === 0 && styles.tabTextActive]}>
                        {t("home.myPlaylists")}
                    </Text>
                    <Text style={styles.tabCount}>{allSheets.length}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.tab}
                    onPress={() => setIndex(1)}>
                    <Text style={[styles.tabText, index === 1 && styles.tabTextActive]}>
                        {t("home.starredPlaylists")}
                    </Text>
                    <Text style={styles.tabCount}>{staredSheets.length}</Text>
                </TouchableOpacity>
                <View style={styles.spacer} />
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => showPanel("CreateMusicSheet")}>
                    <Icon
                        name="plus"
                        color={colors.textSecondary}
                        size={rpx(18)}
                    />
                </TouchableOpacity>
            </View>

            {/* Sheet list */}
            <FlashList
                ListEmptyComponent={<Empty />}
                data={(index === 0 ? allSheets : staredSheets) ?? []}
                estimatedItemSize={rpx(72)}
                renderItem={({ item: sheet }) => {
                    const isLocalSheet = !(
                        sheet.platform && sheet.platform !== localPluginPlatform
                    );
                    const coverUri = sheet.coverImg ?? sheet.artwork;
                    const isDefaultSheet = sheet.id === MusicSheet.defaultSheet.id;

                    return (
                        <TouchableOpacity
                            style={styles.item}
                            activeOpacity={0.6}
                            onPress={() => {
                                navigation.navigate(ROUTE_PATH.LOCAL_SHEET_DETAIL, {
                                    id: sheet.id,
                                });
                            }}>
                            {/* Cover */}
                            <View style={styles.itemCover}>
                                <FastImage
                                    style={styles.itemCoverImg}
                                    source={coverUri}
                                    placeholderSource={ImgAsset.albumDefault}
                                />
                                {!isDefaultSheet && (sheet.worksNum ?? 0) > 0 && (
                                    <View style={styles.itemBadge}>
                                        <Text style={styles.itemBadgeText}>
                                            {sheet.worksNum}首
                                        </Text>
                                    </View>
                                )}
                            </View>
                            {/* Info */}
                            <View style={styles.itemInfo}>
                                <Text
                                    style={styles.itemName}
                                    numberOfLines={1}>
                                    {sheet.title}
                                </Text>
                                <Text
                                    style={styles.itemDesc}
                                    numberOfLines={1}>
                                    {isLocalSheet
                                        ? t("home.songCount", { count: sheet.worksNum })
                                        : `${sheet.artist ?? ""}`}
                                </Text>
                            </View>
                            {/* Delete button */}
                            {sheet.id !== MusicSheet.defaultSheet.id && (
                                <TouchableOpacity
                                    style={styles.itemDelete}
                                    onPress={() => {
                                        showDialog("SimpleDialog", {
                                            title: t("dialog.deleteSheetTitle"),
                                            content: t("dialog.deleteSheetContent", {
                                                name: sheet.title,
                                            }),
                                            onOk: async () => {
                                                if (isLocalSheet) {
                                                    await MusicSheet.removeSheet(
                                                        sheet.id,
                                                    );
                                                    Toast.success(t("toast.deleteSuccess"));
                                                } else {
                                                    await MusicSheet.unstarMusicSheet(
                                                        sheet,
                                                    );
                                                    Toast.success(t("toast.hasUnstarred"));
                                                }
                                            },
                                        });
                                    }}>
                                    <Icon
                                        name="trash-outline"
                                        color={"rgba(252,252,252,0.4)"}
                                        size={rpx(16)}
                                    />
                                </TouchableOpacity>
                            )}
                        </TouchableOpacity>
                    );
                }}
                nestedScrollEnabled
            />
        </>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: rpx(20),
        marginVertical: rpx(4),
        marginBottom: rpx(12),
        paddingHorizontal: rpx(16),
    },
    tab: {
        flexDirection: "row",
        alignItems: "center",
        paddingBottom: rpx(6),
        borderBottomWidth: 2,
        borderBottomColor: "transparent",
    },
    tabText: {
        fontSize: rpx(15),
        fontWeight: "500",
        color: "rgba(252,252,252,0.65)",
    },
    tabTextActive: {
        color: "#fcfcfc",
        fontWeight: "700",
        borderBottomColor: "#f17d34",
    },
    tabCount: {
        color: "rgba(252,252,252,0.4)",
        fontWeight: "400",
        marginLeft: rpx(4),
        fontSize: rpx(13),
    },
    spacer: {
        flex: 1,
    },
    addBtn: {
        width: rpx(32),
        height: rpx(32),
        alignItems: "center",
        justifyContent: "center",
        borderRadius: rpx(16),
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        gap: rpx(12),
        paddingVertical: rpx(10),
        paddingHorizontal: rpx(8),
        marginHorizontal: rpx(8),
        borderRadius: rpx(8),
    },
    itemCover: {
        width: rpx(52),
        height: rpx(52),
        borderRadius: rpx(8),
        overflow: "hidden",
        flexShrink: 0,
        position: "relative",
    },
    itemCoverImg: {
        width: "100%",
        height: "100%",
    },
    itemBadge: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: rpx(18),
        paddingBottom: rpx(3),
        paddingHorizontal: rpx(4),
        alignItems: "center",
    },
    itemBadgeText: {
        fontSize: rpx(10),
        color: "white",
    },
    itemInfo: {
        flex: 1,
        minWidth: 0,
    },
    itemName: {
        fontSize: rpx(14),
        fontWeight: "600",
        color: "#fcfcfc",
    },
    itemDesc: {
        fontSize: rpx(12),
        color: "rgba(252,252,252,0.65)",
        marginTop: rpx(2),
    },
    itemDelete: {
        width: rpx(32),
        height: rpx(32),
        alignItems: "center",
        justifyContent: "center",
        borderRadius: rpx(16),
    },
});
