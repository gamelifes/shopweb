import React from "react";
import { StyleSheet, View } from "react-native";
import rpx from "@/utils/rpx";

import { useCurrentMusic } from "@/core/trackPlayer";
import useOrientation from "@/hooks/useOrientation";
import Icon from "@/components/base/icon";

export default function Operations() {
    const musicItem = useCurrentMusic();
    const orientation = useOrientation();

    return (
        <View
            style={[
                styles.wrapper,
                orientation === "horizontal" ? styles.horizontalWrapper : null,
            ]}>
            <Icon
                name="heart"
                size={rpx(24)}
                color={(musicItem?.isFavorite ?? false) ? "#FF6B6B" : "#FFFFFF"}
                onPress={() => {
                    // TODO: Implement favorite toggle
                }}
            />
            <Icon
                name="share"
                size={rpx(24)}
                color="#FFFFFF"
                onPress={() => {
                    // TODO: Implement share
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
        height: rpx(80),
        marginBottom: rpx(24),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
    },
    horizontalWrapper: {
        marginBottom: 0,
    },
});
