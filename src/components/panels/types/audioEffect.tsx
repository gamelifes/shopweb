import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    View,
    Switch,
    ScrollView,
} from "react-native";
import { useAtom } from "jotai";
import rpx from "@/utils/rpx";
import useColors from "@/hooks/useColors";
import ThemeText from "@/components/base/themeText";
import PanelBase from "../base/panelBase";
import PanelHeader from "../base/panelHeader";
import Divider from "@/components/base/divider";
import AudioEffectNative from "@/native/audioEffect";
import {
    soundEffectEnabledAtom,
    soundEffectSupportedAtom,
    eqStateAtom,
    eqInitializedAtom,
} from "@/store/audioEffectAtom";

/* ============ AudioEffect Panel (方案D 简化版) ============
 * 只做：主开关 + 预设切换
 * 不做：精细滑块、Bass Boost、Virtualizer、Loudness
 * 原因：react-native-track-player 不暴露 audio session id，无法绑定流
 */

const PRESET_FALLBACK = [
    "正常", "流行", "摇滚", "爵士",
    "古典", "舞曲", "人声", "自定义",
];

export default function AudioEffect() {
    const colors = useColors();
    const [enabled, setEnabled] = useAtom(soundEffectEnabledAtom);
    const [isSupported, setIsSupported] = useAtom(soundEffectSupportedAtom);
    const [eqState, setEqState] = useAtom(eqStateAtom);
    const [, setInitialized] = useAtom(eqInitializedAtom);

    useEffect(() => {
        initEffect();
    }, []);

    const initEffect = async () => {
        try {
            const result = await AudioEffectNative.init();
            setIsSupported(result.isSupported);

            if (result.isSupported) {
                // 获取预设列表和当前预设
                const presetNames = await AudioEffectNative.getPresetNames();
                const currentPreset = await AudioEffectNative.getCurrentPreset();
                setEqState({
                    currentPreset,
                    presetNames: presetNames.length > 0 ? presetNames : PRESET_FALLBACK,
                });
            }
            setInitialized(true);
        } catch (e) {
            console.warn("AudioEffect init failed:", e);
            setIsSupported(false);
            setInitialized(true);
        }
    };

    const toggleEnabled = async (val: boolean) => {
        setEnabled(val);
        try {
            await AudioEffectNative.setEnabled(val);
        } catch (e) {
            // 静默失败
        }
    };

    const selectPreset = async (idx: number) => {
        try {
            await AudioEffectNative.setPreset(idx);
            setEqState(prev => ({ ...prev, currentPreset: idx }));
        } catch (e) {
            console.warn("setPreset failed:", e);
        }
    };

    // 设备不支持音效
    if (!isSupported) {
        return (
            <PanelBase
                keyboardAvoidBehavior="none"
                positionMethod="bottom"
                height={rpx(360)}
                renderBody={() => (
                    <ScrollView
                        style={[styles.scroll, { backgroundColor: colors.card }]}
                        showsVerticalScrollIndicator={false}>
                        <PanelHeader title="音效 & 均衡器" hideButtons />
                        <Divider />
                        <View style={styles.unsupportedBox}>
                            <ThemeText
                                fontSize="subTitle"
                                fontWeight="semibold"
                                style={{ color: colors.textSecondary, textAlign: "center" }}>
                                当前设备暂不支持音效
                            </ThemeText>
                            <ThemeText
                                fontSize="tag"
                                style={{ color: colors.textMuted, textAlign: "center", marginTop: rpx(12) }}>
                                {"Android AudioEffect 需绑定到具体音频流。\n本应用使用 react-native-track-player，无法暴露 audio session id，因此无法实现实时均衡。"}
                            </ThemeText>
                        </View>
                    </ScrollView>
                )}
            />
        );
    }

    return (
        <PanelBase
            keyboardAvoidBehavior="none"
            positionMethod="bottom"
            height={rpx(420)}
            renderBody={() => (
                <ScrollView
                    style={[styles.scroll, { backgroundColor: colors.card }]}
                    showsVerticalScrollIndicator={false}>
                    <PanelHeader title="音效 & 均衡器" hideButtons />
                    <Divider />

                    {/* 主开关 */}
                    <View style={styles.master}>
                        <ThemeText fontSize="subTitle" fontWeight="semibold">
                            音效总开关
                        </ThemeText>
                        <Switch
                            value={enabled}
                            onValueChange={toggleEnabled}
                            trackColor={{ false: colors.divider, true: colors.primary + "66" }}
                            thumbColor={enabled ? colors.primary : colors.textSecondary}
                        />
                    </View>

                    {/* 预设切换 */}
                    <View style={styles.section}>
                        <ThemeText
                            fontSize="subTitle"
                            fontWeight="semibold"
                            style={styles.sectionLabel}>
                            预设
                        </ThemeText>
                        <View style={styles.presetGrid}>
                            {eqState.presetNames.slice(0, 8).map((name, idx) => (
                                <PresetButton
                                    key={idx}
                                    name={name}
                                    selected={eqState.currentPreset === idx}
                                    onPress={() => selectPreset(idx)}
                                />
                            ))}
                        </View>
                        <ThemeText
                            fontSize="tag"
                            style={{ color: colors.textMuted, marginTop: rpx(16), textAlign: "center" }}>
                            {"注意：精细滑块和 Bass Boost 等功能需绑定音频流，\n当前播放栈不支持。"}
                        </ThemeText>
                    </View>
                </ScrollView>
            )}
        />
    );
}

/* ============ PresetButton 子组件 ============ */
interface IPresetButtonProps {
    name: string;
    selected: boolean;
    onPress: () => void;
}

function PresetButton({ name, selected, onPress }: IPresetButtonProps) {
    const colors = useColors();
    return (
        <View>
            <ThemeText
                fontSize="tag"
                fontWeight={selected ? "semibold" : "regular"}
                onPress={onPress}
                style={[
                    styles.preset,
                    {
                        backgroundColor: selected ? colors.primary : "transparent",
                        borderColor: selected ? colors.primary : colors.divider,
                        color: selected ? colors.card : colors.text,
                    },
                ]}>
                {name}
            </ThemeText>
        </View>
    );
}

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
        paddingHorizontal: rpx(24),
    },
    master: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: rpx(16),
    },
    section: {
        marginTop: rpx(8),
    },
    sectionLabel: {
        marginBottom: rpx(12),
    },
    presetGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: rpx(8),
    },
    preset: {
        paddingHorizontal: rpx(16),
        paddingVertical: rpx(8),
        borderRadius: rpx(20),
        borderWidth: 1,
        overflow: "hidden",
    },
    unsupportedBox: {
        paddingVertical: rpx(48),
        paddingHorizontal: rpx(24),
        alignItems: "center",
    },
});
