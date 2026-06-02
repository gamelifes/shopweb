import React from "react";
import { StyleSheet, View } from "react-native";
import rpx from "@/utils/rpx";
import SeekBar from "./seekBar";
import PlayControl from "./playControl";
import Operations from "@/pages/musicDetail/components/content/albumCover/operations";
import useOrientation from "@/hooks/useOrientation";

export default function Bottom() {
    const orientation = useOrientation();
    return (
        <View
            style={[
                styles.wrapper,
                orientation === "horizontal"
                    ? {
                        height: rpx(240),
                      }
                    : undefined,
            ]}>
            <View style={styles.row}>
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
        height: rpx(240),
    },
    row: {
        height: rpx(80),
        alignItems: "center",
        justifyContent: "center",
    },
});