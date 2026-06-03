import { showPanel } from "@/components/panels/usePanel.ts";
import { useI18N } from "@/core/i18n";
import { useSheetItem } from "@/core/musicSheet";
import { useParams } from "@/core/router";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import rpx from "@/utils/rpx";
import IconButton from "@/components/base/iconButton";

export default function NavBar() {
    const navigation = useNavigation<any>();
    const { id = "favorite" } = useParams<"local-sheet-detail">();
    const musicSheet = useSheetItem(id);
    const { t } = useI18N();

    const showMenu = () => {
        // Open edit sheet info dialog directly
        showPanel("EditMusicSheetInfo", {
            musicSheet: musicSheet,
        });
    };

    return (
        <View style={styles.container}>
            <IconButton
                name="arrow-left"
                sizeType="normal"
                color="white"
                style={styles.button}
                onPress={() => navigation.goBack()}
            />
            <Text style={styles.title} numberOfLines={1}>
                {musicSheet?.title ?? t("common.sheet")}
            </Text>
            <TouchableOpacity
                style={styles.moreButton}
                onPress={showMenu}>
                <IconButton
                    name="ellipsis-vertical"
                    sizeType="normal"
                    color="rgba(255,255,255,0.7)"
                    style={styles.button}
                    onPress={showMenu}
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        height: rpx(48),
        paddingHorizontal: rpx(12),
    },
    button: {
        width: rpx(36),
        height: rpx(36),
        borderRadius: rpx(18),
    },
    moreButton: {
        width: rpx(36),
        height: rpx(36),
        borderRadius: rpx(18),
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        flex: 1,
        fontSize: rpx(17),
        fontWeight: "700",
        color: "white",
        textAlign: "center",
        paddingHorizontal: rpx(12),
    },
});
