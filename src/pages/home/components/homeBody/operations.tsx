import { useI18N } from "@/core/i18n";
import { ROUTE_PATH, useNavigate } from "@/core/router";
import rpx from "@/utils/rpx";
import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import Icon from "@/components/base/icon";
import ThemeText from "@/components/base/themeText";
import useColors from "@/hooks/useColors";
import Color from "color";

/**
 * Operations cards section matching design's .operations-grid:
 *   2-column grid with op-card (icon circle + label)
 */
export default function Operations() {
    const navigate = useNavigate();
    const { t } = useI18N();
    const colors = useColors();

    const actionButtons = [
        {
            iconName: "clock-outline" as const,
            title: t("home.playHistory"),
            action() {
                navigate(ROUTE_PATH.HISTORY);
            },
        },
        {
            iconName: "folder-music-outline" as const,
            title: t("home.localMusic"),
            action() {
                navigate(ROUTE_PATH.LOCAL);
            },
        },
    ] as const;

    return (
        <View style={styles.grid}>
            {actionButtons.map((btn) => (
                <TouchableOpacity
                    key={btn.title}
                    style={[styles.card, { backgroundColor: colors.card }]}
                    onPress={btn.action}
                    activeOpacity={0.7}>
                    <View
                        style={[
                            styles.iconWrap,
                            {
                                backgroundColor: Color(colors.primary).alpha(0.15).toString(),
                            },
                        ]}>
                        <Icon
                            name={btn.iconName}
                            color={colors.primary}
                            size={rpx(28)}
                        />
                    </View>
                    <ThemeText
                        fontSize="subTitle"
                        fontWeight="semibold"
                        style={[styles.label, { color: colors.text }]}>
                        {btn.title}
                    </ThemeText>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    grid: {
        flexDirection: "row",
        gap: rpx(12),
        marginVertical: rpx(16),
        paddingHorizontal: rpx(16),
    },
    card: {
        flex: 1,
        borderRadius: rpx(18),
        padding: rpx(20),
        alignItems: "center",
        gap: rpx(10),
    },
    iconWrap: {
        width: rpx(48),
        height: rpx(48),
        borderRadius: rpx(24),
        alignItems: "center",
        justifyContent: "center",
    },
    label: {
        fontSize: rpx(13),
        fontWeight: "600",
    },
});
