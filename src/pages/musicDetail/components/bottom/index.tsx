import React from "react";
import { StyleSheet, View } from "react-native";
import rpx from "@/utils/rpx";
import SeekBar from "./seekBar";
import PlayControl from "./playControl";
import Operations from "./operations";

export default function Bottom() {
    return (
        <View style={styles.wrapper}>
            <Operations />
            <SeekBar />
            <PlayControl />
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
        paddingHorizontal: rpx(24),
        paddingBottom: rpx(20),
    },
});
