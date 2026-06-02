import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, View } from "react-native";
import rpx from "@/utils/rpx";
import useColors from "@/hooks/useColors";
import ThemeText from "@/components/base/themeText";
import IconButton from "@/components/base/iconButton";
import { useI18N } from "@/core/i18n";

// todo icon: = musicFree(引入自定义字体 居中) search
export default function NavBar() {
    const navigation = useNavigation<any>();
    const colors = useColors();
    const { t } = useI18N();

    return (
        <View style={styles.appbar}>
            <IconButton
                accessibilityLabel={t("home.openSidebar.a11y")}
                name="bars-3"
                style={styles.menu}
                color={colors.text}
                onPress={() => {
                    navigation?.openDrawer();
                }}
            />
            <ThemeText
                fontSize="title"
                fontWeight="bold"
                style={[styles.title]}>
                MusicFree
            </ThemeText>
            <IconButton
                accessibilityLabel="搜索"
                name="magnifying-glass"
                style={styles.search}
                color={colors.text}
                onPress={() => {
                    navigation?.navigate("search");
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    appbar: {
        backgroundColor: "transparent",
        shadowColor: "transparent",
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        height: rpx(88),
    },
    title: {
        marginLeft: rpx(24),
        flex: 1,
        fontWeight: "bold",
    },
    menu: {
        marginLeft: rpx(24),
    },
    search: {
        marginRight: rpx(24),
    },
});
