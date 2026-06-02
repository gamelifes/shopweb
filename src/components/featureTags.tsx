import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAtom } from "jotai";
import { soundEffectAtom, qualityAtom, aiModeAtom } from "@/store/featureTagsAtom";
import rpx from "@/utils/rpx";
import useColors from "@/hooks/useColors";

export default function FeatureTags() {
    const colors = useColors();
    const [soundEffect, setSoundEffect] = useAtom(soundEffectAtom);
    const [quality, setQuality] = useAtom(qualityAtom);
    const [aiMode, setAiMode] = useAtom(aiModeAtom);

    const tags = [
        {
            label: "音效",
            active: !!soundEffect,
            onPress: () => setSoundEffect(!soundEffect),
        },
        {
            label: "品质",
            active: quality === "高质量",
            onPress: () => setQuality(quality === "标准" ? "高质量" : "标准"),
        },
        {
            label: "AI模式",
            active: !!aiMode,
            onPress: () => setAiMode(!aiMode),
        },
    ] as const;

    return (
        <View style={styles.container}>
            {tags.map((tag) => (
                <TouchableOpacity
                    key={tag.label}
                    activeOpacity={0.7}
                    onPress={tag.onPress}
                    style={[
                        styles.tag,
                        tag.active
                            ? { backgroundColor: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.25)" }
                            : { backgroundColor: "transparent", borderColor: "rgba(255,255,255,0.15)" },
                    ]}>
                    <Text
                        style={[
                            styles.tagText,
                            { color: tag.active ? colors.text : "rgba(255,255,255,0.6)" },
                        ]}>
                        {tag.label}
                    </Text>
                    <Text style={[styles.arrow, { color: tag.active ? colors.text : "rgba(255,255,255,0.4)" }]}>
                        ▸
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "center",
        gap: rpx(8),
        paddingVertical: rpx(8),
        paddingHorizontal: rpx(20),
        flexShrink: 0,
    },
    tag: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: rpx(14),
        paddingVertical: rpx(5),
        borderRadius: rpx(9999),
        borderWidth: 1,
    },
    tagText: {
        fontSize: rpx(22),
        fontWeight: "500",
    },
    arrow: {
        fontSize: rpx(18),
        marginLeft: rpx(4),
    },
});