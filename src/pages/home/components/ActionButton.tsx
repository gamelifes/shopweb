import ThemeText from "@/components/base/themeText";
import useColors from "@/hooks/useColors";
import rpx from "@/utils/rpx";
import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon, { IIconName } from "@/components/base/icon.tsx";

interface IActionButtonProps {
    iconName: IIconName;
    iconColor?: string;
    title: string;
    action?: () => void;
    style?: StyleProp<ViewStyle>;
}

export default function ActionButton(props: IActionButtonProps) {
    const { iconName, iconColor, title, action, style } = props;
    const colors = useColors();
    return (
        <TouchableOpacity
            onPress={action}
            style={[
                styles.wrapper,
                {
                    backgroundColor: colors.card,
                },
                style,
            ]}>
            <View style={styles.content}>
                <Icon
                    accessible={false}
                    name={iconName}
                    color={iconColor ?? colors.text}
                    size={rpx(52)}
                />
                <ThemeText
                    accessible={false}
                    fontSize="subTitle"
                    fontWeight="semibold"
                    style={styles.text}>
                    {title}
                </ThemeText>
            </View>
            <Icon
                accessible={false}
                name="arrow-left"
                color={colors.textSecondary}
                size={rpx(28)}
                style={styles.arrow}
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: rpx(140),
        height: rpx(144),
        borderRadius: rpx(12),
        flexGrow: 1,
        flexShrink: 0,
        flexDirection: "row",
        alignItems: "center",
        overflow: "hidden",
    },
    content: {
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        marginTop: rpx(12),
    },
    arrow: {
        transform: [{ rotate: "180deg" }],
        marginRight: rpx(8),
    },
});
