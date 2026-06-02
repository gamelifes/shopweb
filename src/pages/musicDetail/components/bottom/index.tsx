import React from "react";
import { StyleSheet, View } from "react-native";
import rpx from "@/utils/rpx";
import SeekBar from "./seekBar";
import PlayControl from "./playControl";
import Operations from "./operations";
import useOrientation from "@/hooks/useOrientation";

export default function Bottom() {
    const orientation = useOrientation();
    return (
        <View
            style={[
                styles.wrapper,
                orientation === "horizontal"
                    ? {
                        height: rpx(270),
                    }
                    : undefined,
            ]}>
            <View style={styles.opsRow}>
                <Operations />
            </View>
            <View style={styles.row}>
                <SeekBar />
            </View>
            <View style={styles.row}>
                <PlayControl />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
        height: rpx(270),
    },
    opsRow: {
        height: rpx(80),
        alignItems: "center",
        justifyContent: "center",
    },
    row: {
        height: rpx(90),
        alignItems: "center",
        justifyContent: "center",
    },
});