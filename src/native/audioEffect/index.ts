import { NativeModule, NativeModules } from "react-native";

interface IAudioEffect extends NativeModule {
    init: () => Promise<number>;
    release: () => void;

    getNumberOfBands: () => Promise<number>;
    getBandLevelRange: () => Promise<number[]>;
    getCenterFreq: (band: number) => Promise<number>;
    setBandGain: (band: number, millibels: number) => Promise<void>;
    getBandGain: (band: number) => Promise<number>;
    getPresetNames: () => Promise<string[]>;
    setPreset: (presetIndex: number) => Promise<void>;
    getCurrentPreset: () => Promise<number>;

    setBassBoost: (strength: number) => void;
    getBassBoostStrength: () => Promise<number>;
    isBassBoostSupported: () => Promise<boolean>;

    setVirtualizer: (strength: number) => void;
    getVirtualizerStrength: () => Promise<number>;
    isVirtualizerSupported: () => Promise<boolean>;

    setLoudness: (gainMillibels: number) => void;
    getLoudnessGain: () => Promise<number>;
    isLoudnessSupported: () => Promise<boolean>;

    setEnabled: (enabled: boolean) => void;
    getAudioSessionId: () => Promise<number>;
}

const AudioEffect = NativeModules.AudioEffectModule as IAudioEffect;

export default AudioEffect;
