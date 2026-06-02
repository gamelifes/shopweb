import { useI18N } from "@/core/i18n";
import { ROUTE_PATH, useNavigate } from "@/core/router";
import rpx from "@/utils/rpx";
import React from "react";
import { StyleSheet, View } from "react-native";
import ActionButton from "../ActionButton";

export default function Operations() {
    const navigate = useNavigate();
    const { t } = useI18N();

    const actionButtons = [
        {
            iconName: "clock-outline",
            title: t("home.playHistory"),
            action() {
                navigate(ROUTE_PATH.HISTORY);
            },
        },
        {
            iconName: "folder-music-outline",
            title: t("home.localMusic"),
            action() {
                navigate(ROUTE_PATH.LOCAL);
            },
        },
    ] as const;

    return (
        <View style={styles.container}>
            {actionButtons.map((action, index) => (
                <ActionButton
                    style={[
                        styles.actionButtonStyle,
                        index > 0 ? styles.actionMarginLeft : null,
                    ]}
                    key={action.title}
                    {...action}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: rpx(750),
        paddingHorizontal: rpx(24),
        marginTop: rpx(12),
        marginBottom: rpx(24),
        flexDirection: "row",
        flexWrap: "nowrap",
    },
    actionButtonStyle: {
        flex: 1,
        height: rpx(144),
        borderRadius: rpx(14),
    },
    actionMarginLeft: {
        marginLeft: rpx(16),
    },
});
