import React from "react";
import { StyleProp, StyleSheet, TextStyle, ViewStyle, TouchableOpacity } from "react-native";
import rpx from "@/utils/rpx";
import ThemeText from "./themeText";
import useColors from "@/hooks/useColors";

interface ITagProps {
    tagName: string;
    containerStyle?: StyleProp<ViewStyle>;
    style?: StyleProp<TextStyle>;
    onPress?: () => void;
    active?: boolean;
}
export default function Tag(props: ITagProps) {
    const colors = useColors();
    const handlePress = props.onPress;
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={handlePress}
            style={[
                styles.tag,
                { 
                    backgroundColor: props.active ? `${colors.primary}15` : colors.card,
                    borderColor: props.active ? colors.primary : colors.divider,
                },
                props.containerStyle,
            ]}>
            <ThemeText style={[styles.tagText, props.style]} fontSize="tag">
                {props.tagName}
            </ThemeText>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    tag: {
        height: rpx(32),
        marginLeft: rpx(12),
        paddingHorizontal: rpx(12),
        borderRadius: rpx(24),
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0,
        borderWidth: 1,
        borderStyle: "solid",
    },
    tagText: {
        textAlignVertical: "center",
    },
});
