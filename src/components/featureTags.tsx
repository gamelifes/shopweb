import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAtom } from "jotai";
import { qualityAtom, aiModeAtom } from "@/store/featureTagsAtom";
import { soundEffectEnabledAtom } from "@/store/audioEffectAtom";
import { showPanel } from "@/components/panels/usePanel";
import rpx from "@/utils/rpx";
import useColors from "@/hooks/useColors";

export default function FeatureTags() {
    const colors = useColors();
    const [soundEffect] = useAtom(soundEffectEnabledAtom);
    const [quality, setQuality] = useAtom(qualityAtom);
    const [aiMode, setAiMode] = useAtom(aiModeAtom);

    const tags = [
        {
            label: "音效",
            active: !!soundEffect,
            onPress: () => showPanel("AudioEffect"),
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
                            ? {
                                backgroundColor: colors.text + "1F", // 12% alpha of text color
                                borderColor: colors.text + "40", // 25%
                            }
                            : {
                                backgroundColor: "transparent",
                                borderColor: colors.text + "26", // 15%
                            },
                    ]}>
                    <Text
                        style={[
                            styles.tagText,
                            { color: tag.active ? colors.text : colors.textSecondary },
                        ]}>
                        {tag.label}
                    </Text>
                    <Text style={[styles.arrow, { color: tag.active ? colors.text : colors.textSecondary }]}>
                        ▾
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
        gap: rpx(12),
        paddingVertical: rpx(10),
        paddingHorizontal: rpx(20),
        flexShrink: 0,
    },
    tag: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: rpx(18),
        paddingVertical: rpx(8),
        borderRadius: rpx(9999),
        borderWidth: 1.5,
    },
    tagText: {
        fontSize: rpx(24),
        fontWeight: "600",
    },
    arrow: {
        fontSize: rpx(20),
        marginLeft: rpx(4),
    },
});