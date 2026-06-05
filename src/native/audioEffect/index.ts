import { NativeModules, NativeModule } from "react-native";

export interface IInitResult {
    sessionId: number;
    isSupported: boolean;
}

interface IAudioEffect extends NativeModule {
    init(): Promise<IInitResult>;
    release(): Promise<void>;
    isSupported(): Promise<boolean>;
    getNumberOfBands(): Promise<number>;
    getCenterFreq(band: number): Promise<number>;
    getNumberOfPresets(): Promise<number>;
    getPresetNames(): Promise<string[]>;
    getCurrentPreset(): Promise<number>;
    setPreset(presetIndex: number): Promise<boolean>;
    getBandGain(band: number): Promise<number>;
    getBandLevelRange(): Promise<number[]>;
    setBandGain(band: number, millibels: number): Promise<boolean>;
    setBassBoost(strength: number): Promise<boolean>;
    getBassBoostStrength(): Promise<number>;
    setVirtualizer(strength: number): Promise<boolean>;
    getVirtualizerStrength(): Promise<number>;
    setLoudness(millibels: number): Promise<boolean>;
    getLoudnessGain(): Promise<number>;
    setEnabled(value: boolean): Promise<boolean>;
    getEnabled(): Promise<boolean>;
}

const AudioEffect = NativeModules.AudioEffectModule as IAudioEffect;

export default AudioEffect;
