import { atom } from "jotai";

export const soundEffectEnabledAtom = atom(false);

export interface IEqState {
    /** 5 band gains in millibels */
    bandGains: number[];
    /** Center frequencies in mHz */
    centerFreqs: number[];
    currentPreset: number;
    presetNames: string[];
    bassBoost: number;   // 0-1000
    virtualizer: number; // 0-1000
    loudness: number;    // millibels
}

export const eqStateAtom = atom<IEqState>({
    bandGains: [0, 0, 0, 0, 0],
    centerFreqs: [60000, 230000, 910000, 3600000, 14000000],
    currentPreset: 0,
    presetNames: [],
    bassBoost: 0,
    virtualizer: 0,
    loudness: 0,
});

export const eqInitializedAtom = atom(false);
