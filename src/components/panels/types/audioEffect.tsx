import React, { useEffect, useRef, useState } from "react";
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Switch,
    ScrollView,
    PanResponder,
    LayoutChangeEvent,
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

/* ============ BandSlider (vertical EQ) ============ */
interface IBandSliderProps {
    freq: string;
    value: number;
    min: number;
    max: number;
    onChange: (v: number) => void;
}

function BandSlider({ freq, value, min, max, onChange }: IBandSliderProps) {
    const colors = useColors();
    const range = max - min || 1;
    const pct = (value - min) / range;
    const dbStr = value > 0 ? `+${value}` : `${value}`;
    const trackRef = useRef<View>(null);
    const trackHeightRef = useRef(0);
    const onChangeRef = useRef(onChange);
    const minRef = useRef(min);
    const maxRef = useRef(max);
    const rangeRef = useRef(range);
    onChangeRef.current = onChange;
    minRef.current = min;
    maxRef.current = max;
    rangeRef.current = range;

    const computeValue = (locationY: number) => {
        const h = trackHeightRef.current || 1;
        // Top = max, Bottom = min
        const ratio = Math.max(0, Math.min(1, locationY / h));
        return Math.round(maxRef.current - ratio * rangeRef.current);
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                onChangeRef.current(computeValue(evt.nativeEvent.locationY));
            },
            onPanResponderMove: (evt) => {
                onChangeRef.current(computeValue(evt.nativeEvent.locationY));
            },
        })
    ).current;

    return (
        <View style={bandStyles.container}>
            <ThemeText fontSize="tag" style={[bandStyles.freqLabel, { color: colors.textSecondary }]}>{freq}</ThemeText>
            <View
                ref={trackRef}
                style={[bandStyles.sliderArea]}
                onLayout={(e: LayoutChangeEvent) => {
                    trackHeightRef.current = e.nativeEvent.layout.height; 
                }}>
                <View
                    style={[bandStyles.track, { backgroundColor: colors.divider }]}
                    {...panResponder.panHandlers}>
                    {/* Center line */}
                    <View style={[bandStyles.midLine, { backgroundColor: colors.textSecondary + "80" }]} />
                    {/* Fill: from center to thumb */}
                    {value !== 0 && (
                        <View
                            style={[
                                bandStyles.fill,
                                {
                                    backgroundColor: value > 0 ? colors.primary : colors.textSecondary,
                                    // fill goes from center to wherever the thumb is
                                    top: `${Math.min(pct, 0.5) * 100}%`,
                                    bottom: `${(1 - Math.max(pct, 0.5)) * 100}%`,
                                },
                            ]}
                        />
                    )}
                    {/* Thumb */}
                    <View
                        style={[
                            bandStyles.thumb,
                            {
                                backgroundColor: colors.text,
                                top: `${pct * 100}%`,
                                shadowColor: colors.text + "80",
                            },
                        ]}
                    />
                </View>
            </View>
            <ThemeText
                fontSize="tag"
                fontColor={value > 0 ? "primary" : "textSecondary"}>
                {dbStr}dB
            </ThemeText>
        </View>
    );
}

const bandStyles = StyleSheet.create({
    container: {
        alignItems: "center",
        marginRight: rpx(8),
    },
    freqLabel: {
        marginBottom: rpx(8),
        fontSize: rpx(22),
        fontWeight: "500",
    },
    sliderArea: {
        alignItems: "center",
    },
    track: {
        width: rpx(48),
        height: rpx(180),
        borderRadius: rpx(4),
        position: "relative",
        justifyContent: "center",
        overflow: "visible",
    },
    midLine: {
        position: "absolute",
        left: 0,
        right: 0,
        height: 1,
        top: "50%",
        opacity: 0.3,
    },
    fill: {
        position: "absolute",
        left: 0,
        right: 0,
        borderRadius: rpx(4),
    },
    thumb: {
        width: rpx(22),
        height: rpx(22),
        borderRadius: rpx(11),
        position: "absolute",
        marginTop: -rpx(11),
        marginLeft: rpx(13),
        elevation: 4,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    dbLabel: {
        marginTop: rpx(8),
        fontSize: rpx(22),
        fontWeight: "600",
        fontVariant: ["tabular-nums"],
    },
});

/* ============ AudioEffect Panel ============ */
const PRESET_LABELS = ["正常", "流行", "摇滚", "爵士", "古典", "舞曲", "人声", "自定义"];

/* ------------ Effect toggle item ------------ */
interface IEffectItemProps {
    icon: string;
    name: string;
    desc: string;
    value: number;
    onChange: (v: number) => void;
}

function EffectItem({ icon, name, desc, value, onChange }: IEffectItemProps) {
    const colors = useColors();
    const trackRef = useRef<View>(null);
    const trackWidthRef = useRef(0);
    const pct = value / 1000;

    const computeValue = (locationX: number) => {
        const w = trackWidthRef.current || 1;
        const ratio = Math.max(0, Math.min(1, locationX / w));
        return Math.round(ratio * 1000);
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                onChange(computeValue(evt.nativeEvent.locationX)); 
            },
            onPanResponderMove: (evt) => {
                onChange(computeValue(evt.nativeEvent.locationX)); 
            },
        })
    ).current;

    return (
        <View style={effectStyles.container}>
            <View style={effectStyles.info}>
                <View style={[effectStyles.iconWrap, { backgroundColor: colors.divider }]}>
                    <ThemeText fontSize="subTitle">{icon}</ThemeText>
                </View>
                <View>
                    <ThemeText fontSize="content" fontWeight="medium" style={[effectStyles.name, { color: colors.text }]}>{name}</ThemeText>
                    <ThemeText fontSize="tag" fontColor="textSecondary">{desc}</ThemeText>
                </View>
            </View>
            <View
                ref={trackRef}
                style={[effectStyles.slider, { backgroundColor: colors.divider }]}
                onLayout={(e) => {
                    trackWidthRef.current = e.nativeEvent.layout.width; 
                }}
                {...panResponder.panHandlers}>
                <View style={[effectStyles.fill, { backgroundColor: colors.primary, width: `${Math.round(pct * 100)}%` }]} />
                <View
                    style={[
                        effectStyles.thumb,
                        {
                            backgroundColor: colors.text,
                            shadowColor: colors.text + "80",
                            left: `${Math.round(pct * 100)}%`,
                        },
                    ]}
                />
            </View>
        </View>
    );
}

const effectStyles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: rpx(10),
    },
    info: {
        flexDirection: "row",
        alignItems: "center",
        gap: rpx(10),
        flex: 1,
    },
    iconWrap: {
        width: rpx(32),
        height: rpx(32),
        borderRadius: rpx(8),
        alignItems: "center",
        justifyContent: "center",
    },
    name: {
        fontSize: rpx(24),
    },
    slider: {
        width: rpx(100),
        height: rpx(6),
        borderRadius: rpx(3),
        position: "relative",
        justifyContent: "center",
        marginLeft: rpx(12),
    },
    fill: {
        position: "absolute",
        left: 0,
        height: "100%",
        borderRadius: rpx(3),
    },
    thumb: {
        width: rpx(16),
        height: rpx(16),
        borderRadius: rpx(8),
        position: "absolute",
        marginLeft: -rpx(8),
        elevation: 3,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
});

/* ============ Main Panel ============ */

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

    const selectPreset = async (idx: number) => {
        await AudioEffectNative.setPreset(idx);
        // 重新读取该预设的所有参数
        const numBands = await AudioEffectNative.getNumberOfBands();
        const gains: number[] = [];
        for (let i = 0; i < numBands; i++) {
            gains.push(await AudioEffectNative.getBandGain(i));
        }
        const bass = await AudioEffectNative.getBassBoostStrength();
        const virt = await AudioEffectNative.getVirtualizerStrength();
        const loud = await AudioEffectNative.getLoudnessGain();
        setEqState(prev => ({
            ...prev,
            currentPreset: idx,
            bandGains: gains,
            bassBoost: bass,
            virtualizer: virt,
            loudness: loud,
        }));
    };

    const onBandGain = async (band: number, value: number) => {
        try {
            await AudioEffectNative.setBandGain(band, value);
            setEqState(prev => {
                const gains = [...prev.bandGains];
                gains[band] = value;
                return { ...prev, bandGains: gains, currentPreset: 7 };
            });
        } catch (e) {
            console.warn(`setBandGain(${band}, ${value}) failed:`, e);
        }
    };

    const freqLabels = ["60Hz", "230Hz", "910Hz", "3.6kHz", "14kHz"];

    return (
        <PanelBase
            keyboardAvoidBehavior="none"
            positionMethod="bottom"
            height={rpx(780)}
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
                                                ? { color: colors.text }
                                                : undefined
                                        }>
                                        {name}
                                    </ThemeText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Frequency Bands - design aligned */}
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

                    {/* Effects - design aligned */}
                    <View style={[styles.section, { borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: rpx(16) }]}>
                        <EffectItem
                            icon={"🔊"}
                            name={"Bass Boost"}
                            desc={"低音增强"}
                            value={eqState.bassBoost}
                            onChange={(v) => {
                                AudioEffectNative.setBassBoost(v);
                                setEqState(prev => ({ ...prev, bassBoost: v }));
                            }}
                        />
                        <EffectItem
                            icon={"🌐"}
                            name={"Virtualizer"}
                            desc={"3D 环绕声"}
                            value={eqState.virtualizer}
                            onChange={(v) => {
                                AudioEffectNative.setVirtualizer(v);
                                setEqState(prev => ({ ...prev, virtualizer: v }));
                            }}
                        />
                        <EffectItem
                            icon={"📢"}
                            name={"Loudness"}
                            desc={"响度增强"}
                            value={Math.round((Math.min(Math.max(eqState.loudness + 50000, 0), 100000) / 100))}
                            onChange={(v) => {
                                const millibels = Math.round(v * 100 - 50000);
                                AudioEffectNative.setLoudness(millibels);
                                setEqState(prev => ({ ...prev, loudness: millibels }));
                            }}
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
