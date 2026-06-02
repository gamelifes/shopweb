import React, { memo } from "react";
import { StyleSheet, View } from "react-native";
import Image from "./image";
import useColors from "@/hooks/useColors";
import Theme from "@/core/theme";
import { LinearGradient } from "react-native-linear-gradient";
import color from "color";

function PageBackground() {
    const theme = Theme.useTheme();
    const background = Theme.useBackground();
    const colors = useColors();

    return (
        <>
            <View
                style={[
                    style.wrapper,
                    {
                        backgroundColor:
                            colors?.pageBackground ?? colors.background,
                    },
                ]}
            />
            {!theme.id.startsWith("p-") && background?.url ? (
                <Image
                    uri={background.url}
                    style={[
                        style.wrapper,
                        {
                            opacity: background?.opacity ?? 0.6,
                        },
                    ]}
                    blurRadius={background?.blur ?? 20}
                />
            ) : null}
            {theme.id.startsWith("p-") ? (
                <LinearGradient
                    colors={[
                        color(colors.primary).alpha(0.04).toString(),
                        "transparent",
                    ]}
                    style={style.wrapper}
                    pointerEvents="none"
                />
            ) : null}
        </>
    );
}
export default memo(PageBackground, () => true);

const style = StyleSheet.create({
    wrapper: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
    },
});
