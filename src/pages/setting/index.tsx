import React from "react";
import { StyleSheet } from "react-native";
import settingTypes from "./settingTypes";
import { SafeAreaView } from "react-native-safe-area-context";
import StatusBar from "@/components/base/statusBar";
import { useParams } from "@/core/router";
import { useAppConfig } from "@/core/appConfig";
import HorizontalSafeAreaView from "@/components/base/horizontalSafeAreaView.tsx";
import AppBar from "@/components/base/appBar";
import { useI18N } from "@/core/i18n";
import useColors from "@/hooks/useColors";

export default function Setting() {
    const { t } = useI18N();
    const { type } = useParams<"setting">();
    const settingItem = settingTypes[type];
    const colors = useColors();

    return (
        <SafeAreaView edges={["bottom", "top"]} style={style.wrapper}>
            <StatusBar />
            {settingItem.showNav === false ? null : (
                <AppBar color={colors.appBar}>{t(settingItem.i18nKey as any)}</AppBar>
            )}

            {type === "plugin" ? (
                <settingItem.component />
            ) : (
                <HorizontalSafeAreaView style={style.wrapper}>
                    <settingItem.component />
                </HorizontalSafeAreaView>
            )}
        </SafeAreaView>
    );
}

const style = StyleSheet.create({
    wrapper: {
        width: "100%",
        flex: 1,
    },
});
