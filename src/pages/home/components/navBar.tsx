import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, View } from "react-native";
import rpx from "@/utils/rpx";
import useColors from "@/hooks/useColors";
import ThemeText from "@/components/base/themeText";
import IconButton from "@/components/base/iconButton";

/**
 * Home NavBar matching design's .home-nav:
 *   [☰]  MusicFree  [🔍]
 */
export default function NavBar() {
    const navigation = useNavigation<any>();
    const colors = useColors();

    return (
        <View style={styles.container}>
            <IconButton
                name="bars-3"
                style={styles.menu}
                color={colors.text}
                sizeType="normal"
                onPress={() => {
                    navigation?.openDrawer();
                }}
            />
            <ThemeText
                fontSize="title"
                fontWeight="bold"
                style={styles.title}>
                MusicFree
            </ThemeText>
            <IconButton
                name="magnifying-glass"
                style={styles.search}
                color={colors.textSecondary}
                sizeType="normal"
                onPress={() => {
                    navigation?.navigate("search");
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        height: rpx(52),
        paddingHorizontal: rpx(4),
    },
    menu: {
        width: rpx(40),
        height: rpx(40),
    },
    title: {
        flex: 1,
        fontSize: rpx(20),
        fontWeight: "800",
        paddingLeft: rpx(8),
    },
    search: {
        width: rpx(40),
        height: rpx(40),
    },
});
