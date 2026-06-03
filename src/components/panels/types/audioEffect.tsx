import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    View,
    TouchableOpacity,
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
    eqStateAtom,
    eqInitializedAtom,
} from "@/store/audioEffectAtom";

/* ============ Slider Component ============ */
interface ISliderProps {
    value: number;
    min: number;
    max: number;
    onChange: (v: number) => void;
    label: string;
    suffix?: string;
    showValue?: boolean;
}

function EqSlider({ value, min, max, onChange: _onChange, label, showValue, suffix }: ISliderProps) {
    const colors = useColors();
    const pct = max > min ? (value - min) / (max - min) : 0;

    return (
        <View style={sliderStyles.container}>
            <ThemeText fontSize="tag" style={sliderStyles.label}>{label}</ThemeText>
            <View style={[sliderStyles.track, { backgroundColor: colors.divider }]}>
                <View
                    style={[
                        sliderStyles.fill,
                        {
                            backgroundColor: colors.primary,
                            width: `${Math.round(pct * 100)}%`,
                        },
                    ]}
                />
                <View
                    style={[
                        sliderStyles.thumb,
                        {
                            backgroundColor: colors.primary,
                            left: `${Math.round(pct * 100)}%`,
                        },
                    ]}
                />
            </View>
            {showValue && (
                <ThemeText fontSize="tag" style={sliderStyles.value}>
                    {value > 0 ? "+" : ""}{value}{suffix}
                </ThemeText>
            )}
        </View>
    );
}

const sliderStyles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: rpx(16),
    },
    label: {
        width: rpx(80),
        textAlign: "right",
        marginRight: rpx(12),
    },
    track: {
        flex: 1,
        height: rpx(6),
        borderRadius: rpx(3),
        position: "relative",
        justifyContent: "center",
    },
    fill: {
        position: "absolute",
        left: 0,
        height: "100%",
        borderRadius: rpx(3),
    },
    thumb: {
        width: rpx(20),
        height: rpx(20),
        borderRadius: rpx(10),
        position: "absolute",
        marginLeft: -rpx(10),
    },
    value: {
        width: rpx(64),
        textAlign: "right",
        marginLeft: rpx(8),
    },
});

/* ============ Band Gain Slider ============ */
interface IBandSliderProps {
    freq: string;
    value: number;
    min: number;
    max: number;
    onChange: (v: number) => void;
}

function BandSlider({ freq, value, min, max, onChange: _onChange }: IBandSliderProps) {
    const colors = useColors();
    const range = max - min || 1;
    const pct = (value - min) / range;
    const dbStr = value > 0 ? `+${value}` : `${value}`;

    return (
        <View style={bandStyles.container}>
            <ThemeText fontSize="tag" style={bandStyles.freqLabel}>{freq}</ThemeText>
            <View style={bandStyles.sliderArea}>
                <View style={[bandStyles.track, { backgroundColor: colors.divider }]}>
                    <View
                        style={[
                            bandStyles.midLine,
                            { backgroundColor: colors.textSecondary, opacity: 0.3 },
                        ]}
                    />
                    {value !== 0 && (
                        <View
                            style={[
                                bandStyles.fill,
                                {
                                    backgroundColor: value > 0 ? colors.primary : "#e74c3c",
                                    left: pct > 0.5 ? "50%" : `${pct * 100}%`,
                                    width: `${Math.abs(pct - 0.5) * 200}%`,
                                },
                            ]}
                        />
                    )}
                    <View
                        style={[
                            bandStyles.thumb,
                            {
                                backgroundColor: colors.primary,
                                left: `${pct * 100}%`,
                            },
                        ]}
                    />
                </View>
                <ThemeText fontSize="tag" fontColor="textSecondary" style={bandStyles.dbLabel}>
                    {dbStr}dB
                </ThemeText>
            </View>
        </View>
    );
}

const bandStyles = StyleSheet.create({
    container: {
        alignItems: "center",
        marginRight: rpx(12),
    },
    freqLabel: {
        marginBottom: rpx(8),
    },
    sliderArea: {
        alignItems: "center",
    },
    track: {
        width: rpx(40),
        height: rpx(160),
        borderRadius: rpx(20),
        position: "relative",
        justifyContent: "center",
        overflow: "hidden",
    },
    midLine: {
        position: "absolute",
        left: 0,
        right: 0,
        height: 1,
        top: "50%",
    },
    fill: {
        position: "absolute",
        top: 0,
        height: "100%",
        borderRadius: rpx(20),
    },
    thumb: {
        width: rpx(24),
        height: rpx(24),
        borderRadius: rpx(12),
        position: "absolute",
        marginTop: -rpx(12),
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    dbLabel: {
        marginTop: rpx(8),
    },
});

/* ============ AudioEffect Panel ============ */
const PRESET_LABELS = ["正常", "流行", "摇滚", "爵士", "古典", "舞曲", "人声", "自定义"];

export default function AudioEffect() {
    const colors = useColors();
    const [enabled, setEnabled] = useAtom(soundEffectEnabledAtom);
    const [eqState, setEqState] = useAtom(eqStateAtom);
    const [, setInitialized] = useAtom(eqInitializedAtom);
    const [, setLoading] = useState(true);
    const [bandRange, setBandRange] = useState<number[]>([-1500, 1500]);

    useEffect(() => {
        initEffect();
        return () => {
            AudioEffectNative.release();
            setInitialized(false);
        };
    }, []);

    const initEffect = async () => {
        try {
            setLoading(true);
            await AudioEffectNative.init();

            const range = await AudioEffectNative.getBandLevelRange();
            setBandRange(range);

            const names = await AudioEffectNative.getPresetNames();
            const numBands = await AudioEffectNative.getNumberOfBands();
            const freqs: number[] = [];
            const gains: number[] = [];
            for (let i = 0; i < numBands; i++) {
                freqs.push(await AudioEffectNative.getCenterFreq(i));
                gains.push(await AudioEffectNative.getBandGain(i));
            }

            const preset = await AudioEffectNative.getCurrentPreset();
            const bass = await AudioEffectNative.getBassBoostStrength();
            const virt = await AudioEffectNative.getVirtualizerStrength();
            const loud = await AudioEffectNative.getLoudnessGain();

            setEqState({
                bandGains: gains,
                centerFreqs: freqs,
                currentPreset: preset,
                presetNames: names,
                bassBoost: bass,
                virtualizer: virt,
                loudness: loud,
            });

            AudioEffectNative.setEnabled(enabled);
            setInitialized(true);
        } catch (e) {
            console.warn("AudioEffect init failed:", e);
        } finally {
            setLoading(false);
        }
    };

    const toggleEnabled = (val: boolean) => {
        setEnabled(val);
        AudioEffectNative.setEnabled(val);
    };

    const selectPreset = (idx: number) => {
        AudioEffectNative.setPreset(idx);
        setEqState(prev => ({ ...prev, currentPreset: idx }));
    };

    const onBandGain = (band: number, value: number) => {
        AudioEffectNative.setBandGain(band, value);
        setEqState(prev => {
            const gains = [...prev.bandGains];
            gains[band] = value;
            return { ...prev, bandGains: gains, currentPreset: 7 };
        });
    };

    const freqLabels = ["60Hz", "230Hz", "910Hz", "3.6kHz", "14kHz"];

    return (
        <PanelBase
            keyboardAvoidBehavior="none"
            positionMethod="bottom"
            height={rpx(760)}
            renderBody={() => (
                <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                    <PanelHeader title="音效 & 均衡器" hideButtons />
                    <Divider />

                    {/* Master Toggle */}
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

                    {/* Presets */}
                    <View style={styles.section}>
                        <ThemeText fontSize="subTitle" fontWeight="semibold" style={styles.sectionLabel}>
                            预设
                        </ThemeText>
                        <View style={styles.presetGrid}>
                            {(eqState.presetNames.length > 0
                                ? eqState.presetNames
                                : PRESET_LABELS
                            ).slice(0, 8).map((name, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    activeOpacity={0.7}
                                    onPress={() => selectPreset(idx)}
                                    style={[
                                        styles.preset,
                                        {
                                            backgroundColor:
                                                eqState.currentPreset === idx
                                                    ? colors.primary
                                                    : colors.card,
                                            borderColor:
                                                eqState.currentPreset === idx
                                                    ? colors.primary
                                                    : colors.divider,
                                        },
                                    ]}>
                                    <ThemeText
                                        fontSize="tag"
                                        fontWeight="semibold"
                                        style={
                                            eqState.currentPreset === idx
                                                ? { color: "#fff" }
                                                : undefined
                                        }>
                                        {name}
                                    </ThemeText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Frequency Bands */}
                    <View style={styles.section}>
                        <ThemeText fontSize="subTitle" fontWeight="semibold" style={styles.sectionLabel}>
                            频率调节
                        </ThemeText>
                        <View style={styles.bandRow}>
                            {eqState.centerFreqs.map((freq, idx) => (
                                <BandSlider
                                    key={idx}
                                    freq={freqLabels[idx] ?? `${freq}Hz`}
                                    value={eqState.bandGains[idx] ?? 0}
                                    min={bandRange[0]}
                                    max={bandRange[1]}
                                    onChange={(v) => onBandGain(idx, v)}
                                />
                            ))}
                        </View>
                    </View>

                    {/* Effects */}
                    <View style={styles.section}>
                        <ThemeText fontSize="subTitle" fontWeight="semibold" style={styles.sectionLabel}>
                            音效增强
                        </ThemeText>
                        <EqSlider
                            label="Bass"
                            value={eqState.bassBoost}
                            min={0}
                            max={1000}
                            onChange={(v) => {
                                AudioEffectNative.setBassBoost(v);
                                setEqState(prev => ({ ...prev, bassBoost: v }));
                            }}
                            suffix=""
                        />
                        <EqSlider
                            label="3D"
                            value={eqState.virtualizer}
                            min={0}
                            max={1000}
                            onChange={(v) => {
                                AudioEffectNative.setVirtualizer(v);
                                setEqState(prev => ({ ...prev, virtualizer: v }));
                            }}
                            suffix=""
                        />
                        <EqSlider
                            label="Loud"
                            value={Math.round((eqState.loudness + 50000) / 100)}
                            min={0}
                            max={1000}
                            onChange={(v) => {
                                const millibels = Math.round(v * 100 - 50000);
                                AudioEffectNative.setLoudness(millibels);
                                setEqState(prev => ({ ...prev, loudness: millibels }));
                            }}
                            suffix="%"
                        />
                    </View>
                </ScrollView>
            )}
        />
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
        paddingHorizontal: rpx(4),
    },
    section: {
        marginTop: rpx(16),
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
    },
    bandRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: rpx(8),
    },
});
